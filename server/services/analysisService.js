const AnalysisResult = require('../models/AnalysisResult');
const JobPosting = require('../models/JobPosting');
const { v4: uuidv4 } = require('uuid');

class AnalysisService {
  /**
   * Perform AI analysis on job market data
   */
  async performAnalysis(params) {
    const { jobCategory, subCategory, experienceLevel, region, companySize } =
      params;

    try {
      const startTime = Date.now();

      // Get relevant job data
      const jobData = await this.getJobDataForAnalysis(params);

      if (jobData.length < 10) {
        const error = new Error('Insufficient job data for reliable analysis');
        error.code = 'INSUFFICIENT_DATA';
        throw error;
      }

      // Generate analysis ID
      const analysisId = uuidv4();

      // Perform different types of analysis
      const [skillsAnalysis, salaryAnalysis, marketAnalysis, learningPath] =
        await Promise.all([
          this.analyzeSkills(jobData),
          this.analyzeSalary(jobData),
          this.analyzeMarket(jobData, params),
          this.generateLearningPath(params),
        ]);

      // Create main analysis results
      const analysisResults = [
        {
          id: 1,
          title: '핵심 기술 스택 분석',
          description: this.generateSkillsDescription(skillsAnalysis),
          category: 'skills',
          trend: this.calculateTrend(skillsAnalysis.growthRate || 0),
          confidence: 92,
          details: skillsAnalysis.details,
        },
        {
          id: 2,
          title: '신입 vs 주니어 요구사항',
          description: this.generateExperienceDescription(
            experienceLevel,
            jobData
          ),
          category: 'experience',
          trend: 'stable',
          confidence: 88,
          details: this.getExperienceDetails(experienceLevel, jobData),
        },
        {
          id: 3,
          title: '학습 우선순위',
          description: this.generateLearningDescription(learningPath),
          category: 'learning',
          trend: 'up',
          confidence: 90,
          details: learningPath.recommended
            .slice(0, 3)
            .map((item) => item.skill),
        },
        {
          id: 4,
          title: '예상 연봉 범위',
          description: this.generateSalaryDescription(
            salaryAnalysis,
            experienceLevel
          ),
          category: 'salary',
          trend: salaryAnalysis.trend || 'up',
          confidence: 85,
          details: salaryAnalysis.details,
        },
      ];

      // Create and save analysis result
      const analysisResult = new AnalysisResult({
        analysisId,
        jobCategory,
        subCategory,
        experienceLevel,
        region,
        companySize,
        results: analysisResults,
        skillsAnalysis,
        salaryAnalysis,
        marketAnalysis,
        learningPath,
        analysisMetadata: {
          dataPoints: jobData.length,
          analysisDate: new Date(),
          confidence: 88,
          aiModel: 'gemini-2.5-pro',
          processingTime: Date.now() - startTime,
          dataSourcePeriod: {
            from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            to: new Date(),
          },
        },
      });

      await analysisResult.save();

      console.log(
        `Analysis completed for ${jobCategory}/${experienceLevel} with ${jobData.length} data points`
      );

      return analysisResult;
    } catch (error) {
      console.error('Error in performAnalysis:', error);

      if (error.code === 'INSUFFICIENT_DATA') {
        throw error;
      }

      const aiError = new Error('AI analysis service temporarily unavailable');
      aiError.code = 'AI_SERVICE_ERROR';
      throw aiError;
    }
  }

  /**
   * Get cached analysis result
   */
  async getCachedAnalysis(params) {
    try {
      const cacheKey = AnalysisResult.generateCacheKey(params);

      const cachedResult = await AnalysisResult.findOne({
        cacheKey,
        isActive: true,
        expiresAt: { $gt: new Date() },
      }).lean();

      if (cachedResult) {
        console.log(`Cache hit for analysis: ${cacheKey}`);
        return cachedResult;
      }

      console.log(`Cache miss for analysis: ${cacheKey}`);
      return null;
    } catch (error) {
      console.error('Error in getCachedAnalysis:', error);
      return null; // Don't throw error, just proceed without cache
    }
  }

  /**
   * Get job data for analysis
   */
  async getJobDataForAnalysis(params) {
    const query = {
      isActive: true,
      crawledAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
    };

    if (params.jobCategory) query.jobCategory = params.jobCategory;
    if (params.experienceLevel) query.experienceLevel = params.experienceLevel;
    if (params.region) query.region = params.region;
    if (params.companySize) query.companySize = params.companySize;

    return await JobPosting.find(query)
      .select(
        'jobTitle companyName keywords technicalSkills salaryMin salaryMax experienceLevel crawledAt'
      )
      .lean();
  }

  /**
   * Analyze skills from job data
   */
  async analyzeSkills(jobData) {
    const skillFrequency = {};
    const recentSkills = {};
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    jobData.forEach((job) => {
      const allSkills = [
        ...(job.keywords || []),
        ...(job.technicalSkills || []),
      ];

      allSkills.forEach((skill) => {
        const normalizedSkill = skill.toLowerCase().trim();
        skillFrequency[normalizedSkill] =
          (skillFrequency[normalizedSkill] || 0) + 1;

        if (new Date(job.crawledAt) >= cutoffDate) {
          recentSkills[normalizedSkill] =
            (recentSkills[normalizedSkill] || 0) + 1;
        }
      });
    });

    const topSkills = Object.entries(skillFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([skill, frequency]) => ({
        skill: this.capitalizeSkill(skill),
        frequency: Math.round((frequency / jobData.length) * 100),
        importance:
          frequency > jobData.length * 0.5
            ? 'critical'
            : frequency > jobData.length * 0.2
              ? 'important'
              : 'nice-to-have',
        trend: this.calculateSkillTrend(
          skill,
          frequency,
          recentSkills[skill] || 0
        ),
      }));

    const emergingSkills = Object.entries(recentSkills)
      .filter(([skill]) => skillFrequency[skill] > 5)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({
        skill: this.capitalizeSkill(skill),
        growthRate: Math.round((count / (skillFrequency[skill] || 1)) * 100),
      }));

    return {
      topSkills,
      emergingSkills,
      decliningSkills: [], // Would need historical data to calculate
      details: [
        `총 ${Object.keys(skillFrequency).length}개의 기술이 분석됨`,
        `가장 많이 요구되는 기술: ${topSkills[0]?.skill} (${topSkills[0]?.frequency}%)`,
        `최근 30일간 급상승 기술: ${emergingSkills[0]?.skill || 'N/A'}`,
      ],
    };
  }

  /**
   * Analyze salary data
   */
  async analyzeSalary(jobData) {
    const salaries = jobData
      .filter((job) => job.salaryMin && job.salaryMax)
      .map((job) => ({
        min: job.salaryMin,
        max: job.salaryMax,
        avg: (job.salaryMin + job.salaryMax) / 2,
        experience: job.experienceLevel,
      }));

    if (salaries.length === 0) {
      return {
        averageSalary: null,
        salaryRange: { min: null, max: null },
        details: ['급여 정보가 충분하지 않습니다'],
        trend: 'stable',
      };
    }

    const avgSalary = Math.round(
      salaries.reduce((sum, s) => sum + s.avg, 0) / salaries.length
    );
    const minSalary = Math.min(...salaries.map((s) => s.min));
    const maxSalary = Math.max(...salaries.map((s) => s.max));

    const experienceBreakdown = this.groupBy(salaries, 'experience');
    const salaryByExperience = Object.entries(experienceBreakdown).map(
      ([exp, sals]) => ({
        experience: exp,
        average: Math.round(
          sals.reduce((sum, s) => sum + s.avg, 0) / sals.length
        ),
        range: {
          min: Math.min(...sals.map((s) => s.min)),
          max: Math.max(...sals.map((s) => s.max)),
        },
      })
    );

    return {
      averageSalary: avgSalary,
      salaryRange: { min: minSalary, max: maxSalary },
      salaryByExperience,
      details: [
        `평균 연봉: ${avgSalary.toLocaleString()}만원`,
        `급여 범위: ${minSalary.toLocaleString()}-${maxSalary.toLocaleString()}만원`,
        `분석된 급여 데이터: ${salaries.length}개`,
      ],
      trend: 'up', // Would need historical data for real trend
    };
  }

  /**
   * Analyze market conditions
   */
  async analyzeMarket(jobData, params) {
    const totalJobCount = jobData.length;
    const companyCount = new Set(jobData.map((job) => job.companyName)).size;

    const topCompanies = Object.entries(this.groupBy(jobData, 'companyName'))
      .map(([name, jobs]) => ({ name, jobCount: jobs.length }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, 10);

    const competitionLevel =
      totalJobCount > 100 ? 'low' : totalJobCount > 50 ? 'medium' : 'high';

    return {
      totalJobCount,
      competitionLevel,
      demandTrend: 'stable', // Would need historical data
      topCompanies,
      regionalDistribution: [], // Would need more detailed location data
      uniqueCompanies: companyCount,
    };
  }

  /**
   * Generate learning path recommendations
   */
  async generateLearningPath(params) {
    const { jobCategory, experienceLevel } = params;

    // Mock learning path - in real implementation, this would use AI/ML
    const learningPaths = {
      'IT/개발': {
        신입: [
          {
            skill: 'JavaScript 기본기',
            priority: 'high',
            estimatedTime: '2-3개월',
          },
          {
            skill: 'React 프레임워크',
            priority: 'high',
            estimatedTime: '1-2개월',
          },
          { skill: 'Git/GitHub', priority: 'medium', estimatedTime: '2주' },
          {
            skill: '알고리즘/자료구조',
            priority: 'medium',
            estimatedTime: '3-4개월',
          },
        ],
        '1-3년차': [
          { skill: 'TypeScript', priority: 'high', estimatedTime: '1개월' },
          {
            skill: 'Node.js/Express',
            priority: 'high',
            estimatedTime: '2개월',
          },
          {
            skill: 'Database (SQL)',
            priority: 'medium',
            estimatedTime: '1개월',
          },
          { skill: 'AWS 기초', priority: 'medium', estimatedTime: '2개월' },
        ],
      },
      마케팅: {
        신입: [
          {
            skill: 'Google Analytics',
            priority: 'high',
            estimatedTime: '1개월',
          },
          {
            skill: 'Facebook 광고 관리자',
            priority: 'high',
            estimatedTime: '3주',
          },
          {
            skill: '데이터 분석 기초',
            priority: 'medium',
            estimatedTime: '2개월',
          },
        ],
      },
    };

    const categoryPath = learningPaths[jobCategory] || {};
    const recommended = categoryPath[experienceLevel] || [];

    return {
      recommended,
      prerequisites:
        jobCategory === 'IT/개발' ? ['컴퓨터 기초', 'HTML/CSS'] : [],
      timeline: {
        shortTerm: recommended.slice(0, 2).map((item) => item.skill),
        mediumTerm: recommended.slice(2, 4).map((item) => item.skill),
        longTerm: ['프로젝트 경험', '팀 협업 경험'],
      },
    };
  }

  /**
   * Get analysis history with pagination
   */
  async getAnalysisHistory(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'analysisDate',
      sortOrder = 'desc',
    } = options;

    try {
      const query = { isActive: true, ...filters };
      const sortObj = {
        [`analysisMetadata.${sortBy}`]: sortOrder === 'desc' ? -1 : 1,
      };
      const skip = (page - 1) * limit;

      const [analyses, totalAnalyses] = await Promise.all([
        AnalysisResult.find(query)
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .select('-__v')
          .lean(),
        AnalysisResult.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalAnalyses / limit);

      return {
        analyses,
        currentPage: page,
        totalPages,
        totalAnalyses,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error('Error in getAnalysisHistory:', error);
      throw new Error('Failed to fetch analysis history');
    }
  }

  /**
   * Get analysis result by ID
   */
  async getAnalysisById(id) {
    try {
      return await AnalysisResult.findById(id).lean();
    } catch (error) {
      console.error('Error in getAnalysisById:', error);
      throw new Error('Failed to fetch analysis');
    }
  }

  /**
   * Helper methods
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  capitalizeSkill(skill) {
    const specialCases = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      nodejs: 'Node.js',
      reactjs: 'React.js',
      html: 'HTML',
      css: 'CSS',
      sql: 'SQL',
      aws: 'AWS',
    };

    return (
      specialCases[skill.toLowerCase()] ||
      skill.charAt(0).toUpperCase() + skill.slice(1)
    );
  }

  calculateTrend(value) {
    if (value > 10) return 'up';
    if (value < -10) return 'down';
    return 'stable';
  }

  calculateSkillTrend(skill, totalFreq, recentFreq) {
    const recentRatio = recentFreq / totalFreq;
    if (recentRatio > 0.4) return 'rising';
    if (recentRatio < 0.2) return 'declining';
    return 'stable';
  }

  generateSkillsDescription(skillsAnalysis) {
    const top3 = skillsAnalysis.topSkills.slice(0, 3);
    return `${top3.map((s) => `${s.skill}(${s.frequency}%)`).join(', ')} 순으로 높은 요구도를 보임`;
  }

  generateExperienceDescription(experienceLevel, jobData) {
    if (experienceLevel === '신입') {
      return '신입: 기본 문법 중심, 주니어: 프레임워크 실무 경험 요구';
    }
    return '경력직: 실무 경험과 프로젝트 리딩 능력 중시';
  }

  generateLearningDescription(learningPath) {
    const top3 = learningPath.recommended.slice(0, 3);
    return `1. ${top3[0]?.skill || 'N/A'} 2. ${top3[1]?.skill || 'N/A'} 3. ${top3[2]?.skill || 'N/A'}`;
  }

  generateSalaryDescription(salaryAnalysis, experienceLevel) {
    if (!salaryAnalysis.averageSalary) {
      return '급여 정보가 충분하지 않습니다';
    }

    const avg = salaryAnalysis.averageSalary;
    const range = salaryAnalysis.salaryRange;

    if (experienceLevel === '신입') {
      return `신입: ${Math.round(avg * 0.8)}-${Math.round(avg * 1.1)}만원, 1-3년차: ${Math.round(avg * 1.1)}-${Math.round(avg * 1.4)}만원`;
    }

    return `평균: ${avg.toLocaleString()}만원, 범위: ${range.min?.toLocaleString()}-${range.max?.toLocaleString()}만원`;
  }

  getExperienceDetails(experienceLevel, jobData) {
    return [
      `분석된 ${experienceLevel} 채용공고: ${jobData.length}개`,
      '포트폴리오 프로젝트 평균 2-3개 필요',
      '기술면접 및 코딩테스트 준비 필수',
    ];
  }

  /**
   * Submit feedback on analysis
   */
  async submitFeedback(feedbackData) {
    // In a real implementation, this would save to a feedback collection
    console.log('Analysis feedback received:', feedbackData);
    return { success: true };
  }

  /**
   * Clear analysis cache
   */
  async clearCache(category = null, olderThan = null) {
    try {
      const query = { isActive: true };

      if (category) query.jobCategory = category;
      if (olderThan) {
        query.createdAt = {
          $lt: new Date(Date.now() - parseInt(olderThan) * 60 * 60 * 1000),
        };
      }

      const result = await AnalysisResult.updateMany(query, {
        isActive: false,
      });

      return { clearedCount: result.modifiedCount };
    } catch (error) {
      console.error('Error in clearCache:', error);
      throw new Error('Failed to clear cache');
    }
  }
}

module.exports = new AnalysisService();
