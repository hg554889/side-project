const Joi = require('joi');

// Job categories and experience levels for validation
const jobCategories = [
  'IT/개발',
  '마케팅',
  '디자인',
  '기획',
  '영업/세일즈',
  '보안',
  '금융',
];
const experienceLevels = ['신입', '1-3년차', '경력무관'];
const companySizes = ['스타트업', '중견기업', '대기업'];
const regions = [
  '서울',
  '경기',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '기타',
];

/**
 * Validate job query parameters
 */
const validateJobQuery = (query) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    jobCategory: Joi.string().valid(...jobCategories),
    experienceLevel: Joi.string().valid(...experienceLevels),
    region: Joi.string().valid(...regions),
    companySize: Joi.string().valid(...companySizes),
    sortBy: Joi.string()
      .valid('crawledAt', 'jobTitle', 'companyName', 'salaryMin')
      .default('crawledAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  });

  return schema.validate(query);
};

/**
 * Validate job search parameters
 */
const validateJobSearch = (query) => {
  const schema = Joi.object({
    q: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Search query must be at least 2 characters long',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query is required',
    }),
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    jobCategory: Joi.string().valid(...jobCategories),
    experienceLevel: Joi.string().valid(...experienceLevels),
    region: Joi.string().valid(...regions),
    companySize: Joi.string().valid(...companySizes),
  });

  return schema.validate(query);
};

/**
 * Validate analysis request
 */
const validateAnalysisRequest = (data) => {
  const schema = Joi.object({
    jobCategory: Joi.string()
      .valid(...jobCategories)
      .required()
      .messages({
        'any.required': 'Job category is required',
        'any.only': `Job category must be one of: ${jobCategories.join(', ')}`,
      }),
    subCategory: Joi.string().max(50).allow('', null),
    experienceLevel: Joi.string()
      .valid(...experienceLevels)
      .required()
      .messages({
        'any.required': 'Experience level is required',
        'any.only': `Experience level must be one of: ${experienceLevels.join(', ')}`,
      }),
    region: Joi.string()
      .valid(...regions)
      .allow('', null),
    companySize: Joi.string()
      .valid(...companySizes)
      .allow('', null),
  });

  return schema.validate(data);
};

/**
 * Validate job posting creation
 */
const validateJobPosting = (data) => {
  const schema = Joi.object({
    jobTitle: Joi.string().min(1).max(200).required(),
    companyName: Joi.string().min(1).max(100).required(),
    jobCategory: Joi.string()
      .valid(...jobCategories)
      .required(),
    subCategory: Joi.string().max(50).allow('', null),
    experienceLevel: Joi.string()
      .valid(...experienceLevels)
      .required(),
    region: Joi.string()
      .valid(...regions)
      .required(),
    detailedLocation: Joi.string().max(200).allow('', null),
    companySize: Joi.string()
      .valid(...companySizes)
      .allow(null),
    companyIndustry: Joi.string().max(100).allow('', null),
    jobDescription: Joi.string().min(10).max(5000).required(),
    requirements: Joi.string().max(3000).allow('', null),
    preferredQualifications: Joi.string().max(2000).allow('', null),
    keywords: Joi.array().items(Joi.string().max(50)).max(20),
    technicalSkills: Joi.array().items(Joi.string().max(50)).max(15),
    softSkills: Joi.array().items(Joi.string().max(50)).max(10),
    salaryMin: Joi.number().integer().min(0).max(50000).allow(null),
    salaryMax: Joi.number().integer().min(0).max(50000).allow(null),
    salaryText: Joi.string().max(100).allow('', null),
    employmentType: Joi.string()
      .valid('정규직', '계약직', '인턴', '프리랜서')
      .default('정규직'),
    workingHours: Joi.string().max(100).allow('', null),
    benefits: Joi.array().items(Joi.string().max(100)).max(10),
    source: Joi.object({
      platform: Joi.string()
        .valid('사람인', '잡코리아', '워크넷', '코멘토', '링크드인')
        .required(),
      url: Joi.string().uri().allow('', null),
      originalId: Joi.string().max(50).allow('', null),
    }).required(),
    crawledAt: Joi.date().default(Date.now),
  });

  return schema.validate(data);
};

/**
 * Validate bulk job creation
 */
const validateBulkJobs = (data) => {
  const schema = Joi.object({
    jobs: Joi.array()
      .items(
        Joi.object({
          jobTitle: Joi.string().min(1).max(200).required(),
          companyName: Joi.string().min(1).max(100).required(),
          jobCategory: Joi.string()
            .valid(...jobCategories)
            .required(),
          experienceLevel: Joi.string()
            .valid(...experienceLevels)
            .required(),
          region: Joi.string()
            .valid(...regions)
            .required(),
          jobDescription: Joi.string().min(10).max(5000).required(),
          source: Joi.object({
            platform: Joi.string().required(),
            url: Joi.string().allow('', null),
            originalId: Joi.string().allow('', null),
          }).required(),
        })
      )
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.min': 'At least 1 job is required',
        'array.max': 'Maximum 100 jobs can be created at once',
        'any.required': 'Jobs array is required',
      }),
  });

  return schema.validate(data);
};

/**
 * Validate crawling request
 */
const validateCrawlingRequest = (data) => {
  const schema = Joi.object({
    sites: Joi.string()
      .pattern(/^[a-zA-Z,]+$/)
      .default('saramin')
      .messages({
        'string.pattern.base':
          'Sites must be comma-separated site names (e.g., saramin,jobkorea)',
      }),
    keyword: Joi.string().min(1).max(50).default('React'),
    jobCategory: Joi.string()
      .valid(...jobCategories)
      .default('IT/개발'),
    experienceLevel: Joi.string()
      .valid(...experienceLevels)
      .default('신입'),
    maxJobs: Joi.number().integer().min(1).max(200).default(50).messages({
      'number.max': 'Maximum 200 jobs can be crawled at once',
    }),
    region: Joi.string()
      .valid(...regions)
      .allow('', null),
  });

  return schema.validate(data);
};

/**
 * Validate feedback submission
 */
const validateFeedback = (data) => {
  const schema = Joi.object({
    analysisId: Joi.string().required().messages({
      'any.required': 'Analysis ID is required',
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required',
    }),
    feedback: Joi.string().max(1000).allow('', null),
    helpful: Joi.boolean().default(true),
    category: Joi.string()
      .valid('accuracy', 'completeness', 'usefulness', 'other')
      .allow(null),
  });

  return schema.validate(data);
};

/**
 * Validate user input for XSS prevention
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (id) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

/**
 * Validate email address
 */
const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  return schema.validate(email);
};

/**
 * Validate pagination parameters
 */
const validatePagination = (query) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().max(50).default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  });

  return schema.validate(query);
};

/**
 * Validate date range
 */
const validateDateRange = (data) => {
  const schema = Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
      'date.min': 'End date must be after start date',
    }),
    maxDays: Joi.number().integer().min(1).max(365).default(90),
  });

  return schema.validate(data);
};

/**
 * Validate file upload
 */
const validateFileUpload = (file) => {
  const schema = Joi.object({
    filename: Joi.string().required(),
    mimetype: Joi.string()
      .valid(
        'application/json',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      .required(),
    size: Joi.number()
      .max(10 * 1024 * 1024)
      .required()
      .messages({
        'number.max': 'File size cannot exceed 10MB',
      }),
  });

  return schema.validate(file);
};

/**
 * Custom validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 'VALIDATION_ERROR',
        field: error.details[0].path.join('.'),
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Query validation middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 'VALIDATION_ERROR',
        field: error.details[0].path.join('.'),
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Params validation middleware
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 'VALIDATION_ERROR',
        field: error.details[0].path.join('.'),
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  // Validation functions
  validateJobQuery,
  validateJobSearch,
  validateAnalysisRequest,
  validateJobPosting,
  validateBulkJobs,
  validateCrawlingRequest,
  validateFeedback,
  validatePagination,
  validateDateRange,
  validateFileUpload,
  validateEmail,
  validateObjectId,

  // Utility functions
  sanitizeInput,

  // Middleware functions
  validate,
  validateQuery,
  validateParams,

  // Constants
  jobCategories,
  experienceLevels,
  companySizes,
  regions,
};
