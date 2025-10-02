const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');
const { validateJobQuery, validateJobSearch } = require('../utils/validators');
const CrawledJob = require('../models/CrawledJob');
const {
  convertCrawledJobsToLegacy,
  convertLegacyFiltersToCrawled,
  createLegacyPaginationResponse
} = require('../utils/dataAdapter');

/**
 * @route   GET /api/jobs/raw
 * @desc    Get raw job data for testing
 * @access  Public
 */
router.get('/raw', async (req, res) => {
  try {
    console.log('Raw endpoint called');

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({ error: 'Database not connected', readyState: mongoose.connection.readyState });
    }

    const db = mongoose.connection.db;
    const collection = db.collection('job_postings');

    const totalCount = await collection.countDocuments({ is_active: true });
    console.log('Total active jobs:', totalCount);

    const jobs = await collection.find({ is_active: true }).limit(3).toArray();
    console.log('Found jobs:', jobs.length);

    res.json({
      success: true,
      totalActive: totalCount,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Raw endpoint error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

/**
 * @route   GET /api/jobs
 * @desc    Get job postings with filtering and pagination
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      jobCategory,
      experienceLevel,
      region,
      companySize,
      search,
      sortBy = 'scraped_at',
      sortOrder = 'desc',
    } = req.query;

    // Build simple query for testing
    const query = { is_active: true };

    console.log('Query:', query); // Debug log

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query directly on collection to bypass model field mapping
    const db = require('mongoose').connection.db;
    const collection = db.collection('job_postings');

    const [crawledJobs, totalCount] = await Promise.all([
      collection.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      collection.countDocuments(query),
    ]);

    // Return raw data for debugging
    console.log('Found jobs:', crawledJobs.length);
    if (crawledJobs.length > 0) {
      console.log('First job sample:', JSON.stringify(crawledJobs[0], null, 2));
    }

    // Convert to simple format
    const legacyJobs = crawledJobs.map(job => ({
      id: job.id || job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      tags: job.tags || [],
      category: job.job_category,
      url: job.url
    }));

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limitNum);
    const pagination = {
      currentPage: pageNum,
      totalPages,
      totalItems: totalCount,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    };

    // Return in legacy format
    const response = createLegacyPaginationResponse(legacyJobs, pagination);
    res.json(response);

  } catch (error) {
    console.error('Error in /api/jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/jobs/search
 * @desc    Search job postings by text
 * @access  Public
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q: searchText, page = 1, limit = 20, ...filters } = req.query;

    if (!searchText || searchText.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search text must be at least 2 characters long',
      });
    }

    // Build search query
    const query = {
      is_active: true,
      $text: { $search: searchText.trim() }
    };

    // Apply additional filters
    const crawledFilters = convertLegacyFiltersToCrawled(filters);
    if (crawledFilters.job_category) {
      query.job_category = { $regex: crawledFilters.job_category, $options: 'i' };
    }
    if (crawledFilters.experience_level) {
      query.experience_level = crawledFilters.experience_level;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const startTime = Date.now();

    // Execute search with text score
    const [crawledJobs, totalCount] = await Promise.all([
      CrawledJob.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, scraped_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CrawledJob.countDocuments(query),
    ]);

    const searchTime = Date.now() - startTime;

    // Convert to legacy format
    const legacyJobs = convertCrawledJobsToLegacy(crawledJobs);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: legacyJobs,
      searchInfo: {
        query: searchText,
        totalResults: totalCount,
        searchTime: `${searchTime}ms`,
      },
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalJobs: totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error in /api/jobs/search:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job posting by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try to find by crawled job ID first
    const crawledJob = await CrawledJob.findOne({
      $or: [
        { id: id },
        { _id: id }
      ],
      is_active: true
    }).lean();

    if (!crawledJob) {
      return res.status(404).json({
        success: false,
        error: 'Job posting not found',
      });
    }

    // Convert to legacy format
    const { convertCrawledJobToLegacy } = require('../utils/dataAdapter');
    const legacyJob = convertCrawledJobToLegacy(crawledJob);

    res.json({
      success: true,
      data: legacyJob,
    });
  } catch (error) {
    console.error('Error in /api/jobs/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/jobs/stats/overview
 * @desc    Get job statistics overview
 * @access  Public
 */
router.get('/stats/overview', async (req, res, next) => {
  try {
    // Get stats from crawled jobs
    const stats = await CrawledJob.getStats();
    const { convertStatsToLegacy } = require('../utils/dataAdapter');

    // Convert to legacy format
    const legacyStats = convertStatsToLegacy({ overview: stats });

    res.json({
      success: true,
      data: legacyStats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/stats/categories
 * @desc    Get job statistics by category
 * @access  Public
 */
router.get('/stats/categories', async (req, res, next) => {
  try {
    const categoryStats = await jobService.getCategoryStats();

    res.json({
      success: true,
      data: categoryStats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/trending/skills
 * @desc    Get trending skills across all jobs
 * @access  Public
 */
router.get('/trending/skills', async (req, res, next) => {
  try {
    const { limit = 20, category } = req.query;

    const filters = category ? { jobCategory: category } : {};
    const trendingSkills = await jobService.getTrendingSkills(
      filters,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: trendingSkills,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/companies/top
 * @desc    Get top hiring companies
 * @access  Public
 */
router.get('/companies/top', async (req, res, next) => {
  try {
    const { limit = 10, category } = req.query;

    const filters = category ? { jobCategory: category } : {};
    const topCompanies = await jobService.getTopCompanies(
      filters,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: topCompanies,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/latest
 * @desc    Get latest job postings
 * @access  Public
 */
router.get('/latest', async (req, res, next) => {
  try {
    const { limit = 10, hours = 24 } = req.query;

    const latestJobs = await jobService.getLatestJobs(
      parseInt(hours),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: latestJobs,
      meta: {
        timeframe: `${hours} hours`,
        count: latestJobs.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/jobs/bulk
 * @desc    Create multiple job postings (for crawling service)
 * @access  Private (Internal use only)
 */
router.post('/bulk', async (req, res, next) => {
  try {
    // Check if request is from internal service
    const internalToken = req.headers['x-internal-token'];
    if (internalToken !== process.env.INTERNAL_API_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const { jobs } = req.body;

    if (!jobs || !Array.isArray(jobs)) {
      return res.status(400).json({
        success: false,
        error: 'Jobs array is required',
      });
    }

    const result = await jobService.createJobsBulk(jobs);

    res.status(201).json({
      success: true,
      data: {
        created: result.created,
        updated: result.updated,
        failed: result.failed,
        total: jobs.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/jobs/cleanup
 * @desc    Cleanup expired job postings
 * @access  Private (Internal use only)
 */
router.delete('/cleanup', async (req, res, next) => {
  try {
    // Check if request is from internal service
    const internalToken = req.headers['x-internal-token'];
    if (internalToken !== process.env.INTERNAL_API_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const { days = 30 } = req.query;
    const result = await jobService.cleanupExpiredJobs(parseInt(days));

    res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        cutoffDate: result.cutoffDate,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
