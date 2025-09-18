const express = require('express');
const router = express.Router();
const crawlingService = require('../services/crawlingService');
const { dbUtils } = require('../config/database');

/**
 * @route   GET /api/admin/health
 * @desc    Get system health status
 * @access  Public
 */
router.get('/health', async (req, res, next) => {
  try {
    const health = await dbUtils.healthCheck();
    const pythonStatus = await crawlingService.checkPythonEnvironment();

    res.json({
      success: true,
      data: {
        database: health,
        python: pythonStatus,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/crawling/start
 * @desc    Start web crawling process
 * @access  Public (rate limited)
 */
router.post('/crawling/start', async (req, res, next) => {
  try {
    const {
      sites = 'saramin',
      keyword = 'React',
      jobCategory = 'IT/개발',
      experienceLevel = '신입',
      maxJobs = 50,
    } = req.body;

    const options = {
      sites: sites.split(','),
      keyword,
      jobCategory,
      experienceLevel,
      maxJobs: parseInt(maxJobs),
    };

    console.log('🚀 크롤링 요청:', options);

    const result = await crawlingService.startCrawling(options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('크롤링 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/admin/crawling/status
 * @desc    Get crawling status
 * @access  Public
 */
router.get('/crawling/status', async (req, res, next) => {
  try {
    const status = await crawlingService.getCrawlingStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/admin/crawling/environment
 * @desc    Check Python environment
 * @access  Public
 */
router.get('/crawling/environment', async (req, res, next) => {
  try {
    const envInfo = await crawlingService.checkPythonEnvironment();
    res.json({
      success: true,
      data: envInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/admin/jobs/latest
 * @desc    Get latest crawled jobs
 * @access  Public
 */
router.get('/jobs/latest', async (req, res, next) => {
  try {
    const { category, experience, location, limit } = req.query;

    const jobs = await crawlingService.getLatestJobs({
      category,
      experience,
      location,
      limit: parseInt(limit) || 20,
    });

    res.json({
      success: true,
      data: jobs,
      count: jobs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/admin/crawling/logs
 * @desc    Get crawling logs
 * @access  Public
 */
router.get('/crawling/logs', async (req, res, next) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const logPath = path.join(__dirname, '../../web-crawling/logs/crawler.log');

    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, 'utf8');
      const lines = logContent.split('\n').slice(-100); // 최근 100줄만

      res.json({
        success: true,
        data: lines.filter((line) => line.trim()).reverse(), // 최신순
      });
    } else {
      res.json({
        success: true,
        data: ['로그 파일이 아직 생성되지 않았습니다.'],
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/admin/database/stats
 * @desc    Get database statistics
 * @access  Public
 */
router.get('/database/stats', async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const JobPosting = require('../models/JobPosting');
    const AnalysisResult = require('../models/AnalysisResult');

    const [jobsCount, analysisCount, recentJobs, categoryStats] =
      await Promise.all([
        JobPosting.countDocuments({ isActive: true }),
        AnalysisResult.countDocuments({ isActive: true }),
        JobPosting.countDocuments({
          isActive: true,
          crawledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
        JobPosting.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$jobCategory', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        totalJobs: jobsCount,
        totalAnalyses: analysisCount,
        recentJobs24h: recentJobs,
        categoryBreakdown: categoryStats,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/database/cleanup
 * @desc    Clean up old data
 * @access  Private
 */
router.post('/database/cleanup', async (req, res, next) => {
  try {
    // Check internal token
    const internalToken = req.headers['x-internal-token'];
    if (internalToken !== process.env.INTERNAL_API_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const { days = 30 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const JobPosting = require('../models/JobPosting');
    const AnalysisResult = require('../models/AnalysisResult');

    const [deletedJobs, deletedAnalyses] = await Promise.all([
      JobPosting.deleteMany({
        crawledAt: { $lt: cutoffDate },
        isActive: false,
      }),
      AnalysisResult.deleteMany({
        createdAt: { $lt: cutoffDate },
        isActive: false,
      }),
    ]);

    res.json({
      success: true,
      data: {
        deletedJobs: deletedJobs.deletedCount,
        deletedAnalyses: deletedAnalyses.deletedCount,
        cutoffDate: cutoffDate.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/database/reindex
 * @desc    Recreate database indexes
 * @access  Private
 */
router.post('/database/reindex', async (req, res, next) => {
  try {
    // Check internal token
    const internalToken = req.headers['x-internal-token'];
    if (internalToken !== process.env.INTERNAL_API_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    await dbUtils.createIndexes();

    res.json({
      success: true,
      message: 'Database indexes recreated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/system/info
 * @desc    Get system information
 * @access  Public
 */
router.get('/system/info', async (req, res, next) => {
  try {
    const os = require('os');
    const package = require('../../package.json');

    res.json({
      success: true,
      data: {
        application: {
          name: package.name,
          version: package.version,
          environment: process.env.NODE_ENV || 'development',
          uptime: process.uptime(),
        },
        system: {
          platform: os.platform(),
          arch: os.arch(),
          nodeVersion: process.version,
          totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
          freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
          cpuCount: os.cpus().length,
        },
        process: {
          pid: process.pid,
          memoryUsage: process.memoryUsage(),
          resourceUsage: process.resourceUsage ? process.resourceUsage() : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
