const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const JobPosting = require('../models/JobPosting');

class CrawlingService {
  constructor() {
    this.pythonPath = path.join(__dirname, '../../web-crawling');
    this.logPath = path.join(this.pythonPath, 'logs/crawler.log');
    this.activeCrawlers = new Map(); // Track active crawling processes
  }

  /**
   * Start web crawling process
   */
  async startCrawling(options = {}) {
    const {
      sites = ['saramin'],
      keyword = 'React',
      jobCategory = 'IT/개발',
      experienceLevel = '신입',
      maxJobs = 50,
    } = options;

    try {
      // Validate Python environment first
      const pythonCheck = await this.checkPythonEnvironment();
      if (!pythonCheck.isAvailable) {
        throw new Error('Python environment is not properly configured');
      }

      const crawlId = `crawl_${Date.now()}`;
      console.log(`🚀 Starting crawling process: ${crawlId}`);

      // Prepare crawling command
      const scriptPath = path.join(this.pythonPath, 'main_crawler.py');
      const args = [
        scriptPath,
        '--sites',
        sites.join(','),
        '--keyword',
        keyword,
        '--category',
        jobCategory,
        '--experience',
        experienceLevel,
        '--max-jobs',
        maxJobs.toString(),
        '--output-format',
        'json',
      ];

      // Execute Python crawling script
      const result = await this.executePythonScript('python', args, crawlId);

      // Process crawled data
      if (result.success && result.data) {
        const processedJobs = await this.processCrawledData(result.data, {
          keyword,
          jobCategory,
          experienceLevel,
        });

        console.log(
          `✅ Crawling completed: ${crawlId}, processed ${processedJobs.length} jobs`
        );

        return {
          crawlId,
          success: true,
          jobsFound: processedJobs.length,
          sites: sites,
          keyword,
          category: jobCategory,
          experience: experienceLevel,
          timestamp: new Date().toISOString(),
          data: processedJobs.slice(0, 10), // Return first 10 for preview
        };
      }

      throw new Error('Crawling failed or returned no data');
    } catch (error) {
      console.error('❌ Crawling error:', error);
      throw new Error(`Crawling failed: ${error.message}`);
    }
  }

  /**
   * Execute Python script
   */
  async executePythonScript(pythonCmd, args, crawlId) {
    return new Promise((resolve, reject) => {
      const timeout = 600000; // 10분으로 연장
      let output = '';
      let errorOutput = '';
      let isTimeout = false;

      console.log(`[${crawlId}] Executing: ${pythonCmd} ${args.join(' ')}`);

      const process = spawn(pythonCmd, args, {
        cwd: this.pythonPath,
        env: {
          ...process.env,
          PYTHONPATH: this.pythonPath,
          PYTHONUNBUFFERED: '1', // 버퍼링 없이 즉시 출력
        },
      });

      this.activeCrawlers.set(crawlId, {
        process,
        startTime: Date.now(),
        status: 'running',
      });

      // 프로세스 모니터링
      const monitorInterval = setInterval(() => {
        const crawler = this.activeCrawlers.get(crawlId);
        if (crawler && Date.now() - crawler.startTime > timeout) {
          isTimeout = true;
          clearInterval(monitorInterval);
          this.stopCrawling(crawlId);
          reject(
            new Error(
              `Crawling process ${crawlId} timed out after ${timeout / 1000}s`
            )
          );
        }
      }, 10000);

      process.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log(`[${crawlId}] stdout:`, chunk.trim());
      });

      process.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        // 에러가 아닌 로그성 stderr는 무시
        if (!chunk.includes('[INFO]') && !chunk.includes('[DEBUG]')) {
          console.error(`[${crawlId}] stderr:`, chunk.trim());
        }
      });

      process.on('close', (code) => {
        clearInterval(monitorInterval);
        this.activeCrawlers.delete(crawlId);

        if (isTimeout) return; // 이미 타임아웃으로 처리됨

        if (code === 0) {
          try {
            // 더 엄격한 JSON 파싱
            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              if (!data || !data.jobs) {
                throw new Error('Invalid crawling data format');
              }
              resolve({ success: true, data });
            } else {
              resolve({ success: true, data: { jobs: [] } });
            }
          } catch (parseError) {
            console.error(
              `[${crawlId}] Failed to parse crawling output:`,
              parseError
            );
            resolve({
              success: false,
              error: 'Invalid data format',
              data: { jobs: [] },
            });
          }
        } else {
          reject(
            new Error(`Python script exited with code ${code}: ${errorOutput}`)
          );
        }
      });

      process.on('error', (error) => {
        clearInterval(monitorInterval);
        this.activeCrawlers.delete(crawlId);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  /**
   * Process crawled data and save to database
   */
  async processCrawledData(crawledData, metadata) {
    const { keyword, jobCategory, experienceLevel } = metadata;
    const jobs = crawledData.jobs || [];
    const processedJobs = [];

    for (const jobData of jobs) {
      try {
        // Normalize and validate job data
        const normalizedJob = this.normalizeJobData(jobData, {
          keyword,
          jobCategory,
          experienceLevel,
        });

        // Check if job already exists
        const existingJob = await JobPosting.findOne({
          companyName: normalizedJob.companyName,
          jobTitle: normalizedJob.jobTitle,
          'source.platform': normalizedJob.source.platform,
          'source.originalId': normalizedJob.source.originalId,
        });

        if (!existingJob) {
          // Create new job posting
          const newJob = await JobPosting.create(normalizedJob);
          processedJobs.push(newJob);
        } else {
          // Update existing job
          await JobPosting.findByIdAndUpdate(existingJob._id, {
            ...normalizedJob,
            updatedAt: new Date(),
          });
          processedJobs.push(existingJob);
        }
      } catch (error) {
        console.error('Error processing job data:', error, jobData);
      }
    }

    return processedJobs;
  }

  /**
   * Normalize job data from different sources
   */
  normalizeJobData(rawJobData, metadata) {
    const {
      title = '',
      company = '',
      description = '',
      requirements = '',
      skills = [],
      salary = '',
      location = '',
      url = '',
      source = 'unknown',
      posted_date = new Date(),
    } = rawJobData;

    // Extract salary information
    const salaryInfo = this.extractSalaryInfo(salary);

    // Extract and normalize skills
    const extractedSkills = this.extractSkills(
      description + ' ' + requirements
    );
    const allSkills = [...new Set([...skills, ...extractedSkills])];

    // Determine company size (would need a company database for accuracy)
    const companySize = this.estimateCompanySize(company);

    // Map source platform
    const sourcePlatform = this.mapSourcePlatform(source);

    return {
      jobTitle: title.trim(),
      companyName: company.trim(),
      jobCategory: metadata.jobCategory,
      subCategory: null, // Would need classification logic
      experienceLevel: metadata.experienceLevel,
      region: this.normalizeLocation(location),
      detailedLocation: location,
      companySize,
      jobDescription: description.substring(0, 5000),
      requirements: requirements.substring(0, 3000),
      keywords: allSkills.slice(0, 20), // Limit keywords
      technicalSkills: allSkills.filter((skill) =>
        this.isTechnicalSkill(skill)
      ),
      salaryMin: salaryInfo.min,
      salaryMax: salaryInfo.max,
      salaryText: salary,
      employmentType: '정규직', // Default
      source: {
        platform: sourcePlatform,
        url: url,
        originalId: this.generateOriginalId(url, company, title),
      },
      crawledAt: new Date(posted_date),
      isActive: true,
    };
  }

  /**
   * Extract salary information from text
   */
  extractSalaryInfo(salaryText) {
    if (!salaryText) return { min: null, max: null };

    // Common salary patterns
    const patterns = [
      /(\d{1,4})만?\s*원?\s*~\s*(\d{1,4})만?\s*원?/g,
      /(\d{1,4}),?(\d{3})만?\s*원?\s*~\s*(\d{1,4}),?(\d{3})만?\s*원?/g,
      /연봉\s*(\d{1,4})만?\s*원?\s*~\s*(\d{1,4})만?\s*원?/g,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(salaryText);
      if (match) {
        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        return {
          min: min > 1000 ? min : min * 100,
          max: max > 1000 ? max : max * 100,
        };
      }
    }

    return { min: null, max: null };
  }

  /**
   * Extract skills from job description
   */
  extractSkills(text) {
    const commonSkills = [
      'JavaScript',
      'TypeScript',
      'React',
      'Vue',
      'Angular',
      'Node.js',
      'Python',
      'Java',
      'C++',
      'C#',
      'PHP',
      'Ruby',
      'Go',
      'HTML',
      'CSS',
      'SCSS',
      'Sass',
      'MySQL',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'AWS',
      'Azure',
      'GCP',
      'Docker',
      'Kubernetes',
      'Git',
      'GitHub',
      'GitLab',
      'Jira',
      'Slack',
      'Figma',
      'Sketch',
      'Photoshop',
      'Illustrator',
      'Google Analytics',
      'Facebook 광고',
      'SEO',
      'SEM',
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    commonSkills.forEach((skill) => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  /**
   * Check if skill is technical
   */
  isTechnicalSkill(skill) {
    const technicalKeywords = [
      'javascript',
      'python',
      'java',
      'react',
      'vue',
      'angular',
      'html',
      'css',
      'sql',
      'aws',
      'docker',
      'git',
    ];

    return technicalKeywords.some((keyword) =>
      skill.toLowerCase().includes(keyword)
    );
  }

  /**
   * Normalize location
   */
  normalizeLocation(location) {
    if (!location) return '서울';

    const locationMap = {
      서울: '서울',
      경기: '경기',
      부산: '부산',
      대구: '대구',
      인천: '인천',
      광주: '광주',
      대전: '대전',
      울산: '울산',
    };

    for (const [key, value] of Object.entries(locationMap)) {
      if (location.includes(key)) {
        return value;
      }
    }

    return '기타';
  }

  /**
   * Estimate company size
   */
  estimateCompanySize(companyName) {
    const largeCorporations = [
      '삼성',
      '네이버',
      '카카오',
      '엔씨소프트',
      '넷마블',
      'SK',
      '현대',
      'LG',
      '롯데',
      '한화',
      '두산',
      'GS',
    ];

    const mediumCompanies = [
      '토스',
      '당근마켓',
      '야놀자',
      '마켓컬리',
      '배달의민족',
    ];

    const company = companyName.toLowerCase();

    if (
      largeCorporations.some((corp) => company.includes(corp.toLowerCase()))
    ) {
      return '대기업';
    }

    if (mediumCompanies.some((corp) => company.includes(corp.toLowerCase()))) {
      return '중견기업';
    }

    return '스타트업';
  }

  /**
   * Map source platform
   */
  mapSourcePlatform(source) {
    const platformMap = {
      saramin: '사람인',
      jobkorea: '잡코리아',
      worknet: '워크넷',
      programmers: '프로그래머스',
      wanted: '원티드',
    };

    return platformMap[source.toLowerCase()] || '기타';
  }

  /**
   * Generate original ID for deduplication
   */
  generateOriginalId(url, company, title) {
    if (url) {
      const urlMatch = url.match(/\d+/);
      if (urlMatch) return urlMatch[0];
    }

    // Fallback: generate hash from company + title
    const crypto = require('crypto');
    return crypto
      .createHash('md5')
      .update(company + title)
      .digest('hex')
      .substring(0, 10);
  }

  /**
   * Check Python environment
   */
  async checkPythonEnvironment() {
    try {
      // Check Python installation
      const pythonVersion = await this.executeCommand('python --version');

      // Check if virtual environment exists
      const venvPath = path.join(this.pythonPath, '.venv');
      const venvExists = fs.existsSync(venvPath);

      // Check if requirements are installed
      const requirementsPath = path.join(this.pythonPath, 'requirements.txt');
      const requirementsExist = fs.existsSync(requirementsPath);

      // Check main crawler script
      const mainCrawlerPath = path.join(this.pythonPath, 'main_crawler.py');
      const crawlerExists = fs.existsSync(mainCrawlerPath);

      return {
        isAvailable: pythonVersion.includes('Python'),
        pythonVersion: pythonVersion.trim(),
        venvExists,
        requirementsExist,
        crawlerExists,
        pythonPath: this.pythonPath,
        status: pythonVersion.includes('Python') ? 'ready' : 'error',
      };
    } catch (error) {
      return {
        isAvailable: false,
        error: error.message,
        status: 'error',
      };
    }
  }

  /**
   * Execute shell command
   */
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout || stderr);
        }
      });
    });
  }

  /**
   * Get crawling status
   */
  async getCrawlingStatus() {
    return {
      activeCrawlers: this.activeCrawlers.size,
      activeProcesses: Array.from(this.activeCrawlers.keys()),
      pythonEnvironment: await this.checkPythonEnvironment(),
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Get latest crawled jobs
   */
  async getLatestJobs(options = {}) {
    const { category, experience, location, limit = 20 } = options;

    try {
      const query = {
        isActive: true,
        crawledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      };

      if (category) query.jobCategory = category;
      if (experience) query.experienceLevel = experience;
      if (location) query.region = location;

      const jobs = await JobPosting.find(query)
        .sort({ crawledAt: -1 })
        .limit(parseInt(limit))
        .select(
          'jobTitle companyName jobCategory experienceLevel region crawledAt source'
        )
        .lean();

      return jobs;
    } catch (error) {
      console.error('Error in getLatestJobs:', error);
      throw new Error('Failed to fetch latest jobs');
    }
  }

  /**
   * Stop crawling process
   */
  async stopCrawling(crawlId) {
    if (this.activeCrawlers.has(crawlId)) {
      const process = this.activeCrawlers.get(crawlId);
      process.kill('SIGTERM');
      this.activeCrawlers.delete(crawlId);
      return { success: true, message: `Crawling process ${crawlId} stopped` };
    }

    return { success: false, message: 'Crawling process not found' };
  }

  /**
   * Get crawling logs
   */
  async getCrawlingLogs(lines = 100) {
    try {
      if (!fs.existsSync(this.logPath)) {
        return ['No log file found'];
      }

      const logContent = fs.readFileSync(this.logPath, 'utf8');
      const logLines = logContent
        .split('\n')
        .filter((line) => line.trim())
        .slice(-lines)
        .reverse();

      return logLines;
    } catch (error) {
      console.error('Error reading log file:', error);
      return [`Error reading log file: ${error.message}`];
    }
  }

  /**
   * Cleanup old crawled data
   */
  async cleanupOldData(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await JobPosting.deleteMany({
        crawledAt: { $lt: cutoffDate },
        isActive: false,
      });

      console.log(`Cleaned up ${result.deletedCount} old crawled jobs`);
      return result;
    } catch (error) {
      console.error('Error in cleanupOldData:', error);
      throw new Error('Failed to cleanup old data');
    }
  }

  /**
   * Cleanup active crawlers and resources
   */
  async cleanup() {
    for (const [crawlId, crawler] of this.activeCrawlers.entries()) {
      try {
        await this.stopCrawling(crawlId);
      } catch (error) {
        console.error(`Failed to stop crawler ${crawlId}:`, error);
      }
    }
  }
}

module.exports = new CrawlingService();
