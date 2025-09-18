const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema(
  {
    // Analysis Parameters
    analysisId: {
      type: String,
      required: [true, 'Analysis ID is required'],
      unique: true,
      index: true,
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
    },

    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['신입', '1-3년차', '경력무관'],
      index: true,
    },

    region: {
      type: String,
      trim: true,
    },

    companySize: {
      type: String,
      enum: ['스타트업', '중견기업', '대기업'],
    },

    // Analysis Results
    results: [
      {
        id: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: [true, 'Result title is required'],
          maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
          type: String,
          required: [true, 'Result description is required'],
          maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        category: {
          type: String,
          required: [true, 'Result category is required'],
          enum: [
            'skills',
            'experience',
            'learning',
            'salary',
            'market',
            'trends',
          ],
        },
        trend: {
          type: String,
          enum: ['up', 'down', 'stable'],
          default: 'stable',
        },
        confidence: {
          type: Number,
          min: 0,
          max: 100,
          default: 85,
        },
        details: [
          {
            type: String,
            maxlength: [500, 'Detail cannot exceed 500 characters'],
          },
        ],
        data: {
          type: mongoose.Schema.Types.Mixed, // Flexible data structure
        },
      },
    ],

    // Skills Analysis
    skillsAnalysis: {
      topSkills: [
        {
          skill: {
            type: String,
            required: true,
          },
          frequency: {
            type: Number,
            min: 0,
            max: 100,
          },
          importance: {
            type: String,
            enum: ['critical', 'important', 'nice-to-have'],
            default: 'important',
          },
          trend: {
            type: String,
            enum: ['rising', 'stable', 'declining'],
            default: 'stable',
          },
        },
      ],
      emergingSkills: [
        {
          skill: String,
          growthRate: Number,
        },
      ],
      decliningSkills: [
        {
          skill: String,
          declineRate: Number,
        },
      ],
    },

    // Salary Analysis
    salaryAnalysis: {
      averageSalary: {
        type: Number,
        min: 0,
      },
      salaryRange: {
        min: {
          type: Number,
          min: 0,
        },
        max: {
          type: Number,
          min: 0,
        },
      },
      salaryByExperience: [
        {
          experience: String,
          average: Number,
          range: {
            min: Number,
            max: Number,
          },
        },
      ],
      salaryByCompanySize: [
        {
          companySize: String,
          average: Number,
          range: {
            min: Number,
            max: Number,
          },
        },
      ],
    },

    // Market Analysis
    marketAnalysis: {
      totalJobCount: {
        type: Number,
        min: 0,
      },
      competitionLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      demandTrend: {
        type: String,
        enum: ['increasing', 'stable', 'decreasing'],
        default: 'stable',
      },
      topCompanies: [
        {
          name: String,
          jobCount: Number,
        },
      ],
      regionalDistribution: [
        {
          region: String,
          jobCount: Number,
          percentage: Number,
        },
      ],
    },

    // Learning Path Recommendations
    learningPath: {
      recommended: [
        {
          skill: String,
          priority: {
            type: String,
            enum: ['high', 'medium', 'low'],
            default: 'medium',
          },
          estimatedTime: String,
          resources: [
            {
              type: String,
              title: String,
              url: String,
              difficulty: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced'],
              },
            },
          ],
        },
      ],
      prerequisites: [String],
      timeline: {
        shortTerm: [String], // 1-3 months
        mediumTerm: [String], // 3-6 months
        longTerm: [String], // 6+ months
      },
    },

    // Analysis Metadata
    analysisMetadata: {
      dataPoints: {
        type: Number,
        required: [true, 'Data points count is required'],
        min: 0,
      },
      analysisDate: {
        type: Date,
        required: [true, 'Analysis date is required'],
        default: Date.now,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 85,
      },
      aiModel: {
        type: String,
        default: 'gemini-2.5-pro',
      },
      processingTime: {
        type: Number, // in milliseconds
        min: 0,
      },
      dataSourcePeriod: {
        from: Date,
        to: Date,
      },
    },

    // Cache and Performance
    cacheKey: {
      type: String,
      index: true,
    },

    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'analysisresults',
  }
);

// Compound indexes for efficient queries
analysisResultSchema.index({
  jobCategory: 1,
  experienceLevel: 1,
  region: 1,
  companySize: 1,
});
analysisResultSchema.index({ analysisDate: -1 });
analysisResultSchema.index({ cacheKey: 1, isActive: 1 });

// Virtual for analysis summary
analysisResultSchema.virtual('summary').get(function () {
  return {
    category: this.jobCategory,
    experience: this.experienceLevel,
    resultsCount: this.results.length,
    confidence: this.analysisMetadata.confidence,
    dataPoints: this.analysisMetadata.dataPoints,
    analysisDate: this.analysisMetadata.analysisDate,
  };
});

// Instance method to check if analysis is recent
analysisResultSchema.methods.isRecent = function (hours = 24) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hours);
  return this.analysisMetadata.analysisDate >= cutoffDate;
};

// Instance method to get top skills with high confidence
analysisResultSchema.methods.getTopSkills = function (
  limit = 10,
  minFrequency = 20
) {
  return this.skillsAnalysis.topSkills
    .filter((skill) => skill.frequency >= minFrequency)
    .slice(0, limit)
    .map((skill) => ({
      skill: skill.skill,
      frequency: skill.frequency,
      importance: skill.importance,
      trend: skill.trend,
    }));
};

// Static method to find cached analysis
analysisResultSchema.statics.findCached = function (params) {
  const cacheKey = this.generateCacheKey(params);
  return this.findOne({
    cacheKey,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

// Static method to generate cache key
analysisResultSchema.statics.generateCacheKey = function (params) {
  const { jobCategory, experienceLevel, region, companySize } = params;
  return `${jobCategory}_${experienceLevel}_${region || 'all'}_${companySize || 'all'}`;
};

// Static method for advanced search
analysisResultSchema.statics.searchResults = function (filters) {
  const query = { isActive: true };

  if (filters.jobCategory) query.jobCategory = filters.jobCategory;
  if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
  if (filters.region) query.region = filters.region;
  if (filters.companySize) query.companySize = filters.companySize;

  return this.find(query)
    .sort({ 'analysisMetadata.analysisDate': -1 })
    .populate('results');
};

// Pre-save middleware
analysisResultSchema.pre('save', function (next) {
  // Generate cache key if not exists
  if (!this.cacheKey) {
    this.cacheKey = this.constructor.generateCacheKey({
      jobCategory: this.jobCategory,
      experienceLevel: this.experienceLevel,
      region: this.region,
      companySize: this.companySize,
    });
  }

  // Ensure analysis date is set
  if (!this.analysisMetadata.analysisDate) {
    this.analysisMetadata.analysisDate = new Date();
  }

  next();
});

// Export model
module.exports = mongoose.model('AnalysisResult', analysisResultSchema);
