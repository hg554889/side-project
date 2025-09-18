const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');
const { validateJobQuery, validateJobSearch } = require('../utils/validators');

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
      sortBy = 'crawledAt',
      sortOrder = 'desc',
    } = req.query;

    // Validate query parameters
    const { error } = validateJobQuery(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const filters = {
      ...(jobCategory && { jobCategory }),
      ...(experienceLevel && { experienceLevel }),
      ...(region && { region }),
      ...(companySize && { companySize }),
    };

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Max 100 items per page
      sortBy,
      sortOrder,
    };

    const result = await jobService.getJobs(filters, options);

    res.json({
      success: true,
      data: result.jobs,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalJobs: result.totalJobs,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
    });
  } catch (error) {
    next(error);
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

    // Validate search parameters
    const { error } = validateJobSearch(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    if (!searchText || searchText.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search text must be at least 2 characters long',
      });
    }

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
    };

    const result = await jobService.searchJobs(
      searchText.trim(),
      filters,
      options
    );

    res.json({
      success: true,
      data: result.jobs,
      searchInfo: {
        query: searchText,
        totalResults: result.totalJobs,
        searchTime: result.searchTime,
      },
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalJobs: result.totalJobs,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
    });
  } catch (error) {
    next(error);
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

    const job = await jobService.getJobById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job posting not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/jobs/stats/overview
 * @desc    Get job statistics overview
 * @access  Public
 */
router.get('/stats/overview', async (req, res, next) => {
  try {
    const stats = await jobService.getJobStats();

    res.json({
      success: true,
      data: stats,
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
