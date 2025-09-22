const express = require('express');
const router = express.Router();
const CrawledJob = require('../models/CrawledJob');

/**
 * @swagger
 * components:
 *   schemas:
 *     CrawledJob:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         company_name:
 *           type: string
 *         work_location:
 *           type: string
 *         keywords:
 *           type: array
 *           items:
 *             type: string
 *         salary_range:
 *           type: string
 *         job_category:
 *           type: string
 *         quality_score:
 *           type: number
 *         source_site:
 *           type: string
 *         scraped_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/crawled/jobs:
 *   get:
 *     summary: Get crawled job postings with filtering and pagination
 *     tags: [Crawled Jobs]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Job category filter
 *       - in: query
 *         name: experience
 *         schema:
 *           type: string
 *         description: Experience level filter
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Work location filter
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Source site filter
 *       - in: query
 *         name: minQuality
 *         schema:
 *           type: number
 *         description: Minimum quality score
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: scraped_at
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successfully retrieved crawled jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CrawledJob'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 */
router.get('/jobs', async (req, res) => {
  try {
    const {
      keyword,
      category,
      experience,
      location,
      source,
      minQuality = 0,
      page = 1,
      limit = 20,
      sortBy = 'scraped_at',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query = { is_active: true };

    // Add filters
    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (category) {
      query.job_category = { $regex: category, $options: 'i' };
    }

    if (experience) {
      query.experience_level = experience;
    }

    if (location) {
      query.work_location = { $regex: location, $options: 'i' };
    }

    if (source) {
      query.source_site = source;
    }

    if (minQuality > 0) {
      query.quality_score = { $gte: parseFloat(minQuality) };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [jobs, totalCount] = await Promise.all([
      CrawledJob.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .select('-raw_data') // Exclude raw_data for performance
        .lean(),
      CrawledJob.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        itemsPerPage: limitNum,
      },
      filters: {
        keyword,
        category,
        experience,
        location,
        source,
        minQuality,
      },
    });
  } catch (error) {
    console.error('Error fetching crawled jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crawled jobs',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/crawled/jobs/search:
 *   get:
 *     summary: Search crawled jobs by keywords
 *     tags: [Crawled Jobs]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/jobs/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    // Text search with score
    const jobs = await CrawledJob.find(
      { $text: { $search: q }, is_active: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, quality_score: -1 })
      .limit(parseInt(limit))
      .select('-raw_data')
      .lean();

    res.json({
      success: true,
      data: jobs,
      query: q,
      count: jobs.length,
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/crawled/jobs/stats:
 *   get:
 *     summary: Get crawling statistics
 *     tags: [Crawled Jobs]
 *     responses:
 *       200:
 *         description: Crawling statistics
 */
router.get('/jobs/stats', async (req, res) => {
  try {
    const stats = await CrawledJob.getStats();

    // Additional statistics
    // const [categoryStats, sourceStats, qualityStats] = await Promise.all([
    //   // Jobs by category
    //   CrawledJob.aggregate([
    //     { $match: { is_active: true } },
    //     { $group: { _id: '$job_category', count: { $sum: 1 } } },
    //     { $sort: { count: -1 } },
    //   ]),

    //   // Jobs by source site
    //   CrawledJob.aggregate([
    //     { $match: { is_active: true } },
    //     { $group: { _id: '$source_site', count: { $sum: 1 } } },
    //     { $sort: { count: -1 } },
    //   ]),

    //   // Quality distribution
    //   CrawledJob.aggregate([
    //     { $match: { is_active: true } },
    //     {
    //       $group: {
    //         _id: {
    //           $switch: {
    //             branches: [
    //               { case: { $gte: ['$quality_score', 0.8] }, then: 'high' },
    //               { case: { $gte: ['$quality_score', 0.5] }, then: 'medium' },
    //             ],
    //             default: 'low',
    //           },
    //         },
    //         count: { $sum: 1 },
    //       },
    //     },
    //   ]),
    // ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        byCategory: [],
        bySource: [],
        qualityDistribution: [],
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/crawled/jobs/latest:
 *   get:
 *     summary: Get latest crawled jobs
 *     tags: [Crawled Jobs]
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Latest crawled jobs
 */
router.get('/jobs/latest', async (req, res) => {
  try {
    const { hours = 24, limit = 50 } = req.query;

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const jobs = await CrawledJob.find({
      is_active: true,
      scraped_at: { $gte: since },
    })
      .sort({ scraped_at: -1, quality_score: -1 })
      .limit(parseInt(limit))
      .select('-raw_data')
      .lean();

    res.json({
      success: true,
      data: jobs,
      count: jobs.length,
      since: since.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest jobs',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/crawled/jobs/{id}:
 *   get:
 *     summary: Get specific crawled job by ID
 *     tags: [Crawled Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await CrawledJob.findOne({ id, is_active: true }).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/crawled/health:
 *   get:
 *     summary: Get crawling system health status
 *     tags: [Crawled Jobs]
 *     responses:
 *       200:
 *         description: System health status
 */
router.get('/health', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalJobs, recentJobs, hourlyJobs] = await Promise.all([
      CrawledJob.countDocuments({ is_active: true }),
      CrawledJob.countDocuments({
        is_active: true,
        scraped_at: { $gte: oneDayAgo },
      }),
      CrawledJob.countDocuments({
        is_active: true,
        scraped_at: { $gte: oneHourAgo },
      }),
    ]);

    const isHealthy = recentJobs > 0; // At least some jobs in the last 24 hours

    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'warning',
        totalJobs,
        jobsLast24Hours: recentJobs,
        jobsLastHour: hourlyJobs,
        lastCheck: now.toISOString(),
        message: isHealthy
          ? 'Crawling system is operating normally'
          : 'No recent crawling activity detected',
      },
    });
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
});

module.exports = router;