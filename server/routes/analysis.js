const express = require('express');
const router = express.Router();
const analysisService = require('../services/analysisService');
const { validateAnalysisRequest } = require('../utils/validators');

/**
 * @route   POST /api/analysis/start
 * @desc    Start AI analysis for job market
 * @access  Public
 */
router.post('/start', async (req, res, next) => {
  try {
    const { jobCategory, subCategory, experienceLevel, region, companySize } =
      req.body;

    // Validate request body
    const { error } = validateAnalysisRequest(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const analysisParams = {
      jobCategory,
      subCategory,
      experienceLevel,
      region,
      companySize,
    };

    // Check for cached analysis first
    const cachedResult =
      await analysisService.getCachedAnalysis(analysisParams);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true,
        message: 'Analysis retrieved from cache',
      });
    }

    // Start new analysis
    const result = await analysisService.performAnalysis(analysisParams);

    res.json({
      success: true,
      data: result,
      cached: false,
      message: 'Analysis completed successfully',
    });
  } catch (error) {
    // Handle specific analysis errors
    if (error.code === 'INSUFFICIENT_DATA') {
      return res.status(422).json({
        success: false,
        error: 'Insufficient job data for reliable analysis',
        code: 'INSUFFICIENT_DATA',
        recommendation: 'Try broader filters or check back later',
      });
    }

    if (error.code === 'AI_SERVICE_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'AI analysis service temporarily unavailable',
        code: 'AI_SERVICE_ERROR',
        recommendation: 'Please try again in a few minutes',
      });
    }

    next(error);
  }
});

/**
 * @route   GET /api/analysis/history
 * @desc    Get analysis history
 * @access  Public
 */
router.get('/history', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      jobCategory,
      experienceLevel,
      sortBy = 'analysisDate',
      sortOrder = 'desc',
    } = req.query;

    const filters = {
      ...(jobCategory && { jobCategory }),
      ...(experienceLevel && { experienceLevel }),
    };

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50),
      sortBy,
      sortOrder,
    };

    const result = await analysisService.getAnalysisHistory(filters, options);

    res.json({
      success: true,
      data: result.analyses,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalAnalyses: result.totalAnalyses,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/analysis/:id
 * @desc    Get specific analysis result by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const analysis = await analysisService.getAnalysisById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/analysis/trends/skills
 * @desc    Get trending skills analysis across categories
 * @access  Public
 */
router.get('/trends/skills', async (req, res, next) => {
  try {
    const {
      jobCategory,
      timeframe = '30', // days
      limit = 20,
    } = req.query;

    const filters = jobCategory ? { jobCategory } : {};
    const trendAnalysis = await analysisService.getSkillsTrends(
      filters,
      parseInt(timeframe),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: trendAnalysis,
      meta: {
        timeframe: `${timeframe} days`,
        category: jobCategory || 'all',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/analysis/salary/insights
 * @desc    Get salary insights and trends
 * @access  Public
 */
router.get('/salary/insights', async (req, res, next) => {
  try {
    const { jobCategory, experienceLevel, region, companySize } = req.query;

    const filters = {
      ...(jobCategory && { jobCategory }),
      ...(experienceLevel && { experienceLevel }),
      ...(region && { region }),
      ...(companySize && { companySize }),
    };

    const salaryInsights = await analysisService.getSalaryInsights(filters);

    res.json({
      success: true,
      data: salaryInsights,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/analysis/market/overview
 * @desc    Get job market overview and trends
 * @access  Public
 */
router.get('/market/overview', async (req, res, next) => {
  try {
    const { timeframe = '90' } = req.query; // days

    const marketOverview = await analysisService.getMarketOverview(
      parseInt(timeframe)
    );

    res.json({
      success: true,
      data: marketOverview,
      meta: {
        timeframe: `${timeframe} days`,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/analysis/compare
 * @desc    Compare multiple job categories or experience levels
 * @access  Public
 */
router.post('/compare', async (req, res, next) => {
  try {
    const { comparisons } = req.body;

    if (!comparisons || !Array.isArray(comparisons) || comparisons.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 comparison items are required',
      });
    }

    if (comparisons.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 items can be compared at once',
      });
    }

    // Validate each comparison item
    for (const item of comparisons) {
      const { error } = validateAnalysisRequest(item);
      if (error) {
        return res.status(400).json({
          success: false,
          error: `Invalid comparison item: ${error.details[0].message}`,
        });
      }
    }

    const comparisonResult = await analysisService.compareAnalyses(comparisons);

    res.json({
      success: true,
      data: comparisonResult,
      meta: {
        comparedItems: comparisons.length,
        comparisonDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/analysis/learning-path
 * @desc    Get personalized learning path recommendations
 * @access  Public
 */
router.get('/learning-path', async (req, res, next) => {
  try {
    const {
      jobCategory,
      experienceLevel,
      currentSkills = '',
      targetRole,
    } = req.query;

    if (!jobCategory || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Job category and experience level are required',
      });
    }

    const skillsArray = currentSkills
      ? currentSkills.split(',').map((s) => s.trim())
      : [];

    const learningPath = await analysisService.generateLearningPath({
      jobCategory,
      experienceLevel,
      currentSkills: skillsArray,
      targetRole,
    });

    res.json({
      success: true,
      data: learningPath,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/analysis/feedback
 * @desc    Submit feedback on analysis quality
 * @access  Public
 */
router.post('/feedback', async (req, res, next) => {
  try {
    const { analysisId, rating, feedback, helpful = true } = req.body;

    if (!analysisId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Analysis ID and rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }

    await analysisService.submitFeedback({
      analysisId,
      rating,
      feedback,
      helpful,
      submittedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/analysis/cache/clear
 * @desc    Clear analysis cache (admin only)
 * @access  Private
 */
router.delete('/cache/clear', async (req, res, next) => {
  try {
    // Check if request is from internal service
    const internalToken = req.headers['x-internal-token'];
    if (internalToken !== process.env.INTERNAL_API_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const { category, olderThan } = req.query;
    const result = await analysisService.clearCache(category, olderThan);

    res.json({
      success: true,
      data: {
        clearedCount: result.clearedCount,
        message: 'Cache cleared successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
