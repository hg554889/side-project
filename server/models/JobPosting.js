const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema(
  {
    // Basic Information
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters'],
    },

    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },

    jobCategory: {
      type: String,
      required: [true, 'Job category is required'],
      enum: [
        'IT/개발',
        '마케팅',
        '디자인',
        '기획',
        '영업/세일즈',
        '보안',
        '금융',
      ],
      index: true,
    },

    subCategory: {
      type: String,
      trim: true,
      maxlength: [50, 'Sub category cannot exceed 50 characters'],
    },

    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['신입', '1-3년차', '경력무관'],
      index: true,
    },

    // Location Information
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      index: true,
    },

    detailedLocation: {
      type: String,
      trim: true,
    },

    // Company Information
    companySize: {
      type: String,
      enum: ['스타트업', '중견기업', '대기업'],
      index: true,
    },

    companyIndustry: {
      type: String,
      trim: true,
    },

    // Job Details
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Job description cannot exceed 5000 characters'],
    },

    requirements: {
      type: String,
      maxlength: [3000, 'Requirements cannot exceed 3000 characters'],
    },

    preferredQualifications: {
      type: String,
      maxlength: [
        2000,
        'Preferred qualifications cannot exceed 2000 characters',
      ],
    },

    // Skills and Keywords
    keywords: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],

    technicalSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    softSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Salary Information
    salaryMin: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },

    salaryMax: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },

    salaryText: {
      type: String,
      trim: true,
    },

    // Employment Details
    employmentType: {
      type: String,
      enum: ['정규직', '계약직', '인턴', '프리랜서'],
      default: '정규직',
    },

    workingHours: {
      type: String,
      trim: true,
    },

    benefits: [
      {
        type: String,
        trim: true,
      },
    ],

    // Source Information
    source: {
      platform: {
        type: String,
        required: [true, 'Source platform is required'],
        enum: ['사람인', '잡코리아', '워크넷', '코멘토', '링크드인'],
      },
      url: {
        type: String,
        trim: true,
      },
      originalId: {
        type: String,
        trim: true,
      },
    },

    // Analysis Data
    analysisScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    popularityScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    difficultyLevel: {
      type: String,
      enum: ['초급', '중급', '고급', '전문가'],
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    crawledAt: {
      type: Date,
      required: [true, 'Crawled date is required'],
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'jobpostings',
  }
);

// Indexes for better query performance
jobPostingSchema.index({ jobCategory: 1, experienceLevel: 1, region: 1 });
jobPostingSchema.index({ companyName: 1, jobTitle: 1 }, { unique: true });
jobPostingSchema.index({ keywords: 1 });
jobPostingSchema.index({ crawledAt: -1 });
jobPostingSchema.index({ 'source.platform': 1, 'source.originalId': 1 });

// Text index for search functionality
jobPostingSchema.index(
  {
    jobTitle: 'text',
    companyName: 'text',
    jobDescription: 'text',
    keywords: 'text',
  },
  {
    weights: {
      jobTitle: 10,
      companyName: 5,
      keywords: 8,
      jobDescription: 1,
    },
    name: 'job_search_index',
  }
);

// Virtual for salary range
jobPostingSchema.virtual('salaryRange').get(function () {
  if (this.salaryMin && this.salaryMax) {
    return `${this.salaryMin.toLocaleString()}-${this.salaryMax.toLocaleString()}만원`;
  }
  return this.salaryText || '급여 협의';
});

// Virtual for company info
jobPostingSchema.virtual('companyInfo').get(function () {
  return {
    name: this.companyName,
    size: this.companySize,
    industry: this.companyIndustry,
    location: this.region,
  };
});

// Instance method to check if job posting is recent
jobPostingSchema.methods.isRecent = function (days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.crawledAt >= cutoffDate;
};

// Static method to find jobs by category and experience
jobPostingSchema.statics.findByFilter = function (filters) {
  const query = { isActive: true };

  if (filters.jobCategory) query.jobCategory = filters.jobCategory;
  if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
  if (filters.region) query.region = filters.region;
  if (filters.companySize) query.companySize = filters.companySize;

  return this.find(query);
};

// Static method for text search
jobPostingSchema.statics.searchJobs = function (searchText, filters = {}) {
  const query = {
    $text: { $search: searchText },
    isActive: true,
    ...filters,
  };

  return this.find(query, { score: { $meta: 'textScore' } }).sort({
    score: { $meta: 'textScore' },
  });
};

// Pre-save middleware
jobPostingSchema.pre('save', function (next) {
  // Set expiration date (30 days from crawl date)
  if (!this.expiresAt && this.crawledAt) {
    this.expiresAt = new Date(
      this.crawledAt.getTime() + 30 * 24 * 60 * 60 * 1000
    );
  }

  // Update updatedAt
  this.updatedAt = new Date();

  next();
});

// Export model
module.exports = mongoose.model('JobPosting', jobPostingSchema);
