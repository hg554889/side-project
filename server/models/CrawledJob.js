const mongoose = require('mongoose');

const crawledJobSchema = new mongoose.Schema(
  {
    // Unique identifier from crawler
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Basic job information
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    company_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Location information
    work_location: {
      type: String,
      trim: true,
      index: true,
    },

    // Skills and keywords
    keywords: {
      type: [String],
      default: [],
      index: true,
    },

    // Salary information
    salary_range: {
      type: String,
      trim: true,
    },

    // Job categorization
    job_category: {
      type: String,
      trim: true,
      index: true,
    },

    // Data quality metrics
    quality_score: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
      index: true,
    },

    // Detailed job information
    description: {
      type: String,
    },

    requirements: {
      type: String,
    },

    benefits: {
      type: String,
    },

    // Experience level
    experience_level: {
      type: String,
      enum: ['신입', '경력', '경력무관', '인턴'],
      index: true,
    },

    // Source information
    source_site: {
      type: String,
      required: true,
      enum: ['saramin', 'worknet', 'worknet_new', 'comento', 'securityfarm'],
      index: true,
    },

    source_url: {
      type: String,
    },

    // Timestamp information
    scraped_at: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Additional metadata
    raw_data: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Status tracking
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Processing status
    processing_status: {
      type: String,
      enum: ['raw', 'normalized', 'processed'],
      default: 'normalized',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'job_postings', // Use same collection as crawler
  }
);

// Compound indexes for better query performance
crawledJobSchema.index({ job_category: 1, experience_level: 1 });
crawledJobSchema.index({ scraped_at: -1, quality_score: -1 });
crawledJobSchema.index({ keywords: 1, job_category: 1 });
crawledJobSchema.index({ source_site: 1, scraped_at: -1 });

// Text search index
crawledJobSchema.index({
  title: 'text',
  company_name: 'text',
  description: 'text',
  keywords: 'text',
});

// Virtual for formatted salary
crawledJobSchema.virtual('formatted_salary').get(function () {
  if (!this.salary_range) return '협의';
  return this.salary_range;
});

// Virtual for days since scraped
crawledJobSchema.virtual('days_since_scraped').get(function () {
  const now = new Date();
  const diffTime = Math.abs(now - this.scraped_at);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Instance method to check if job is recent
crawledJobSchema.methods.isRecent = function (days = 7) {
  const now = new Date();
  const diffTime = Math.abs(now - this.scraped_at);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
};

// Static method to find jobs by keywords
crawledJobSchema.statics.findByKeywords = function (keywords, options = {}) {
  const query = {
    is_active: true,
    keywords: { $in: keywords },
  };

  if (options.category) {
    query.job_category = options.category;
  }

  if (options.experience) {
    query.experience_level = options.experience;
  }

  if (options.minQuality) {
    query.quality_score = { $gte: options.minQuality };
  }

  return this.find(query)
    .sort({ scraped_at: -1, quality_score: -1 })
    .limit(options.limit || 50);
};

// Static method to get statistics
crawledJobSchema.statics.getStats = async function () {
  const pipeline = [
    { $match: { is_active: true } },
    {
      $group: {
        _id: null,
        total_jobs: { $sum: 1 },
        avg_quality: { $avg: '$quality_score' },
        categories: { $addToSet: '$job_category' },
        sites: { $addToSet: '$source_site' },
        recent_jobs: {
          $sum: {
            $cond: [
              {
                $gte: [
                  '$scraped_at',
                  new Date(Date.now() - 24 * 60 * 60 * 1000),
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];

  const [stats] = await this.aggregate(pipeline);
  return stats || {};
};

module.exports = mongoose.model('CrawledJob', crawledJobSchema);