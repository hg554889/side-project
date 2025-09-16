const { spawn } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

class CrawlingService {
    constructor() {
        this.pythonPath = this.findPythonPath();
        this.crawlingDir = path.join(__dirname, '../../web-crawling');
        this.isRunning = false;
    }

/**
   * Python 경로 찾기
   */
    findPythonPath() {
        // Windows와 Unix 시스템 모두 고려
        const possiblePaths = [
            path.join(__dirname, '../../web-crawling/venv/Scripts/python.exe'), // Windows venv
            path.join(__dirname, '../../web-crawling/venv/bin/python'),         // Unix venv
            'python3',  // 시스템 Python3
            'python'    // 시스템 Python
        ];

    // 환경변수에서 지정된 경우
    if (process.env.PYTHON_PATH) {
        possiblePaths.unshift(process.env.PYTHON_PATH);
    }

    return possiblePaths[1]; // 기본적으로 venv 사용
    }

    /**
     * 크롤링 시작 (비동기)
     */
    async startCrawling(options = {}) {
        if (this.isRunning) {
            return {
                success: false,
                error: '이미 크롤링이 진행 중입니다.'
            };
        }

    try {
        this.isRunning = true;
        
        const result = await this.runPythonCrawler(options);
        
        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error('크롤링 서비스 오류:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        this.isRunning = false;
        }
    }

  /**
   * Python 크롤러 실행
   */
  runPythonCrawler(options) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.crawlingDir, 'main.py');
      
      // Python 명령어 인수 구성
      const args = [
        scriptPath,
        '--sites', options.sites ? options.sites.join(',') : 'saramin',
        '--keyword', options.keyword || 'React',
        '--category', options.category || 'IT/개발',
        '--experience', options.experienceLevel || '신입',
        '--max-jobs', String(options.maxJobs || 50),
        '--output', path.join(this.crawlingDir, 'temp', `result_${Date.now()}.json`)
      ];

      console.log(`🐍 Python 크롤러 실행: ${this.pythonPath} ${args.join(' ')}`);

      const pythonProcess = spawn(this.pythonPath, args, {
        cwd: this.crawlingDir,
        env: { 
          ...process.env,
          PYTHONPATH: this.crawlingDir 
        }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(`🐍 Python 출력: ${output.trim()}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(`🐍 Python 오류: ${output.trim()}`);
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // JSON 결과 파싱
            const jsonMatch = stdout.match(/\{.*\}/s);
            if (jsonMatch) {
              const result = JSON.parse(jsonMatch[0]);
              resolve(result);
            } else {
              // stdout에서 결과를 찾을 수 없는 경우 기본 응답
              resolve({
                total: { crawled: 0, saved: 0, errors: 0 },
                message: 'Python 크롤러 실행 완료'
              });
            }
          } catch (parseError) {
            console.warn('JSON 파싱 실패, 기본 결과 반환:', parseError);
            resolve({
              total: { crawled: 0, saved: 0, errors: 0 },
              stdout: stdout.trim(),
              message: 'Python 크롤러 실행 완료 (파싱 실패)'
            });
          }
        } else {
          reject(new Error(`Python 크롤러 실행 실패 (코드: ${code})\n${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Python 프로세스 오류: ${error.message}`));
      });

      // 30초 타임아웃
      setTimeout(() => {
        if (!pythonProcess.killed) {
          pythonProcess.kill();
          reject(new Error('Python 크롤러 실행 타임아웃 (30초)'));
        }
      }, 30000);
    });
  }

  /**
   * 크롤링 상태 확인
   */
  async getCrawlingStatus() {
    try {
      const result = await this.runPythonScript('scripts/health_check.py');
      return JSON.parse(result.stdout);
    } catch (error) {
      return {
        database: { status: 'error', error: error.message },
        data_quality: { average_score: 0, low_quality_count: 0 }
      };
    }
  }

  /**
   * 최신 채용공고 조회 (MongoDB 직접 연결)
   */
  async getLatestJobs(filters = {}) {
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmap');
      
      await client.connect();
      const db = client.db('skillmap');
      const collection = db.collection('job_postings');

      const query = {};
      if (filters.category) query.job_category = filters.category;
      if (filters.experience) query.experience_level = filters.experience;
      if (filters.location) query.work_location = new RegExp(filters.location, 'i');

      const jobs = await collection
        .find(query)
        .sort({ scraped_at: -1 })
        .limit(filters.limit || 20)
        .toArray();

      await client.close();
      return jobs;

    } catch (error) {
      console.error('MongoDB 조회 실패:', error);
      return [];
    }
  }

  /**
   * Python 스크립트 실행 (범용)
   */
  runPythonScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const fullScriptPath = path.join(this.crawlingDir, scriptPath);
      
      const pythonProcess = spawn(this.pythonPath, [fullScriptPath, ...args], {
        cwd: this.crawlingDir,
        env: { 
          ...process.env,
          PYTHONPATH: this.crawlingDir 
        }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        } else {
          reject(new Error(`스크립트 실행 실패 (코드: ${code})\n${stderr}`));
        }
      });
    });
  }

  /**
   * Python 환경 확인
   */
  async checkPythonEnvironment() {
    try {
      const { stdout } = await exec(`${this.pythonPath} --version`);
      const venvCheck = await exec(`${this.pythonPath} -c "import sys; print('venv' if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix) else 'system')"`);
      
      return {
        pythonVersion: stdout.trim(),
        environment: venvCheck.stdout.trim(),
        pythonPath: this.pythonPath,
        crawlingDir: this.crawlingDir
      };
    } catch (error) {
      return {
        error: error.message,
        pythonPath: this.pythonPath,
        crawlingDir: this.crawlingDir
      };
    }
  }
}

module.exports = CrawlingService;

// ===========================================
// server/routes/admin.js (수정된 버전)
// ===========================================
const express = require('express');
const router = express.Router();
const CrawlingService = require('../services/crawlingService');

const crawlingService = new CrawlingService();

// 크롤링 시작
router.post('/crawling/start', async (req, res) => {
  try {
    const { sites, keyword, category, experienceLevel, maxJobs } = req.body;
    
    const options = {
      sites: sites ? sites.split(',') : ['saramin'],
      keyword: keyword || 'React',
      category: category || 'IT/개발',
      experienceLevel: experienceLevel || '신입',
      maxJobs: parseInt(maxJobs) || 50
    };

    console.log('🚀 크롤링 요청:', options);
    
    const result = await crawlingService.startCrawling(options);
    
    res.json(result);
  } catch (error) {
    console.error('크롤링 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 크롤링 상태 확인
router.get('/crawling/status', async (req, res) => {
  try {
    const status = await crawlingService.getCrawlingStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Python 환경 확인
router.get('/crawling/environment', async (req, res) => {
  try {
    const envInfo = await crawlingService.checkPythonEnvironment();
    res.json(envInfo);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 최신 채용공고 조회
router.get('/jobs/latest', async (req, res) => {
  try {
    const { category, experience, location, limit } = req.query;
    
    const jobs = await crawlingService.getLatestJobs({
      category,
      experience,
      location,
      limit: parseInt(limit) || 20
    });
    
    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 크롤링 로그 조회
router.get('/crawling/logs', async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const logPath = path.join(__dirname, '../../web-crawling/logs/crawler.log');
    
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, 'utf8');
      const lines = logContent.split('\n').slice(-100); // 최근 100줄만
      
      res.json({
        success: true,
        logs: lines.filter(line => line.trim()).reverse() // 최신순
      });
    } else {
      res.json({
        success: true,
        logs: ['로그 파일이 아직 생성되지 않았습니다.']
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

// ===========================================
// server/config/database.js (MongoDB 설정)
// ===========================================
const { MongoClient } = require('mongodb');

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmap';
    this.dbName = 'skillmap';
  }

  async connect() {
    if (!this.client) {
      try {
        this.client = new MongoClient(this.uri);
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        console.log(`✅ MongoDB 연결 성공: ${this.dbName}`);
      } catch (error) {
        console.error('❌ MongoDB 연결 실패:', error);
        throw error;
      }
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('📴 MongoDB 연결 종료');
    }
  }

  getCollection(name) {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다.');
    }
    return this.db.collection(name);
  }

  async healthCheck() {
    try {
      await this.connect();
      await this.client.admin().ping();
      
      const stats = await this.db.stats();
      const jobsCount = await this.getCollection('job_postings').countDocuments();
      
      return {
        status: 'healthy',
        database: this.dbName,
        collections: stats.collections,
        jobsCount,
        dataSize: `${Math.round(stats.dataSize / 1024 / 1024)}MB`
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = new DatabaseManager();

// ===========================================
// server/middleware/errorHandler.js
// ===========================================
const errorHandler = (err, req, res, next) => {
  console.error('🚨 에러 발생:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // MongoDB 연결 오류
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(503).json({
      success: false,
      error: '데이터베이스 연결 오류',
      code: 'DATABASE_ERROR'
    });
  }

  // Python 스크립트 실행 오류
  if (err.message.includes('Python')) {
    return res.status(500).json({
      success: false,
      error: '크롤링 시스템 오류',
      code: 'CRAWLING_ERROR',
      details: err.message
    });
  }

  // 기본 오류
  res.status(err.status || 500).json({
    success: false,
    error: err.message || '내부 서버 오류',
    code: err.code || 'INTERNAL_ERROR'
  });
};

module.exports = errorHandler;

// ===========================================
// server/index.js (수정된 버전)
// ===========================================
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, '../client/dist')));

// 라우트
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// 기본 API 라우트
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/database');
    const dbHealth = await db.healthCheck();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// React 앱 서빙 (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 에러 핸들러
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📊 API 엔드포인트: http://localhost:${PORT}/api`);
  console.log(`🐍 Python 크롤링 디렉토리: ${path.join(__dirname, '../web-crawling')}`);
});

// 우아한 종료
process.on('SIGTERM', async () => {
  console.log('🔄 서버 종료 중...');
  const db = require('./config/database');
  await db.close();
  process.exit(0);
});

module.exports = app;