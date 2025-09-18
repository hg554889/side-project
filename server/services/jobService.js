const JobPosting = require('../models/JobPosting');
const { v4: uuidv4 } = require('uuid');

class JobService {
  /**
   * Get jobs with filtering and pagination
   */
  async getJobs(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'crawledAt',
      sortOrder = 'desc',
    } = options;

    try {
      const query = { isActive: true, ...filters };
      const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      const skip = (page - 1) * limit;

      // 메모리 효율을 위한 커서 사용
      const cursor = JobPosting.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-__v -updatedAt')
        .lean()
        .cursor();

      const jobs = [];
      for await (const doc of cursor) {
        jobs.push(doc);
      }

      const totalJobs = await JobPosting.countDocuments(query);
      const totalPages = Math.ceil(totalJobs / limit);

      return {
        jobs,
        currentPage: page,
        totalPages,
        totalJobs,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  }

  _handleError(error) {
    // 구체적인 에러 처리
    if (error.name === 'ValidationError') {
      return `Invalid data format: ${error.message}`;
    }
    if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return 'Duplicate entry found';
      }
      return `Database error: ${error.message}`;
    }
    console.error('Unexpected error:', error);
    return 'An unexpected error occurred';
  }

  /**
   * Search jobs by text with filters
   */
  async searchJobs(searchText, filters = {}, options = {}) {
    const { page = 1, limit = 20 } = options;

    try {
      const startTime = Date.now();

      const query = {
        $text: { $search: searchText },
        isActive: true,
        ...filters,
      };

      const skip = (page - 1) * limit;

      const [jobs, totalJobs] = await Promise.all([
        JobPosting.find(query, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit)
          .select('-__v -updatedAt')
          .lean(),
        JobPosting.countDocuments(query),
      ]);

      const searchTime = Date.now() - startTime;
      const totalPages = Math.ceil(totalJobs / limit);

      return {
        jobs,
        currentPage: page,
        totalPages,
        totalJobs,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        searchTime,
      };
    } catch (error) {
      console.error('Error in searchJobs:', error);
      throw new Error('Failed to search jobs');
    }
  }

  /**
   * Get single job by ID
   */
  async getJobById(id) {
    try {
      const job = await JobPosting.findById(id).select('-__v').lean();

      return job;
    } catch (error) {
      console.error('Error in getJobById:', error);
      throw new Error('Failed to fetch job');
    }
  }

  /**
   * Get job statistics overview
   */
  async getJobStats() {
    try {
      const [
        totalJobs,
        activeJobs,
        recentJobs,
        categoryStats,
        experienceStats,
        regionStats,
      ] = await Promise.all([
        JobPosting.countDocuments(),
        JobPosting.countDocuments({ isActive: true }),
        JobPosting.countDocuments({
          isActive: true,
          crawledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
        JobPosting.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$jobCategory', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        JobPosting.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        JobPosting.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$region', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      return {
        overview: {
          totalJobs,
          activeJobs,
          recentJobs,
          inactiveJobs: totalJobs - activeJobs,
        },
        breakdown: {
          categories: categoryStats.map((item) => ({
            name: item._id,
            count: item.count,
          })),
          experience: experienceStats.map((item) => ({
            level: item._id,
            count: item.count,
          })),
          regions: regionStats.map((item) => ({
            region: item._id,
            count: item.count,
          })),
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in getJobStats:', error);
      throw new Error('Failed to fetch job statistics');
    }
  }

  /**
   * Get statistics by category
   */
  async getCategoryStats() {
    try {
      const categoryStats = await JobPosting.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$jobCategory',
            totalJobs: { $sum: 1 },
            avgSalary: { $avg: { $avg: ['$salaryMin', '$salaryMax'] } },
            companies: { $addToSet: '$companyName' },
            recentJobs: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      '$crawledAt',
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            category: '$_id',
            totalJobs: 1,
            avgSalary: { $round: ['$avgSalary', 0] },
            uniqueCompanies: { $size: '$companies' },
            recentJobs: 1,
            _id: 0,
          },
        },
        { $sort: { totalJobs: -1 } },
      ]);

      return categoryStats;
    } catch (error) {
      console.error('Error in getCategoryStats:', error);
      throw new Error('Failed to fetch category statistics');
    }
  }

  /**
   * Get trending skills
   */
  async getTrendingSkills(filters = {}, limit = 20) {
    try {
      const query = { isActive: true, ...filters };

      const trendingSkills = await JobPosting.aggregate([
        { $match: query },
        { $unwind: '$keywords' },
        {
          $group: {
            _id: '$keywords',
            frequency: { $sum: 1 },
            recentCount: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      '$crawledAt',
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            skill: '$_id',
            frequency: 1,
            recentCount: 1,
            trend: {
              $cond: [
                { $gt: ['$recentCount', { $multiply: ['$frequency', 0.3] }] },
                'rising',
                'stable',
              ],
            },
            _id: 0,
          },
        },
        { $sort: { frequency: -1 } },
        { $limit: limit },
      ]);

      return trendingSkills;
    } catch (error) {
      console.error('Error in getTrendingSkills:', error);
      throw new Error('Failed to fetch trending skills');
    }
  }

  /**
   * Get top hiring companies
   */
  async getTopCompanies(filters = {}, limit = 10) {
    try {
      const query = { isActive: true, ...filters };

      const topCompanies = await JobPosting.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$companyName',
            jobCount: { $sum: 1 },
            avgSalary: { $avg: { $avg: ['$salaryMin', '$salaryMax'] } },
            categories: { $addToSet: '$jobCategory' },
            locations: { $addToSet: '$region' },
            recentJobs: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      '$crawledAt',
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            companyName: '$_id',
            jobCount: 1,
            avgSalary: { $round: ['$avgSalary', 0] },
            categories: 1,
            locations: 1,
            recentJobs: 1,
            _id: 0,
          },
        },
        { $sort: { jobCount: -1 } },
        { $limit: limit },
      ]);

      return topCompanies;
    } catch (error) {
      console.error('Error in getTopCompanies:', error);
      throw new Error('Failed to fetch top companies');
    }
  }

  /**
   * Get latest job postings
   */
  async getLatestJobs(hours = 24, limit = 10) {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const latestJobs = await JobPosting.find({
        isActive: true,
        crawledAt: { $gte: cutoffDate },
      })
        .sort({ crawledAt: -1 })
        .limit(limit)
        .select(
          'jobTitle companyName jobCategory experienceLevel region crawledAt keywords'
        )
        .lean();

      return latestJobs;
    } catch (error) {
      console.error('Error in getLatestJobs:', error);
      throw new Error('Failed to fetch latest jobs');
    }
  }

  /**
   * Create multiple jobs (bulk insert for crawling)
   */
  async createJobsBulk(jobsData) {
    const BATCH_SIZE = 100;
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    try {
      // 배치 처리로 성능 개선
      for (let i = 0; i < jobsData.length; i += BATCH_SIZE) {
        const batch = jobsData.slice(i, i + BATCH_SIZE);
        const operations = batch.map((job) => ({
          updateOne: {
            filter: {
              companyName: job.companyName,
              jobTitle: job.jobTitle,
              'source.platform': job.source.platform,
              'source.originalId': job.source.originalId,
            },
            update: {
              $set: { ...job, updatedAt: new Date() },
            },
            upsert: true,
          },
        }));

        const result = await JobPosting.bulkWrite(operations);
        results.created += result.upsertedCount;
        results.updated += result.modifiedCount;
      }

      return results;
    } catch (error) {
      console.error('Bulk operation error:', error);
      throw new Error(`Bulk operation failed: ${error.message}`);
    }
  }

  /**
   * Cleanup expired job postings
   */
  async cleanupExpiredJobs(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await JobPosting.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { crawledAt: { $lt: cutoffDate }, isActive: false },
        ],
      });

      console.log(`Cleaned up ${result.deletedCount} expired jobs`);

      return {
        deletedCount: result.deletedCount,
        cutoffDate: cutoffDate.toISOString(),
      };
    } catch (error) {
      console.error('Error in cleanupExpiredJobs:', error);
      throw new Error('Failed to cleanup expired jobs');
    }
  }

  /**
   * Update job status (activate/deactivate)
   */
  async updateJobStatus(jobId, isActive) {
    try {
      const job = await JobPosting.findByIdAndUpdate(
        jobId,
        { isActive, updatedAt: new Date() },
        { new: true }
      );

      return job;
    } catch (error) {
      console.error('Error in updateJobStatus:', error);
      throw new Error('Failed to update job status');
    }
  }

  /**
   * Get job recommendations based on skills
   */
  async getRecommendations(userSkills = [], limit = 10) {
    try {
      const jobs = await JobPosting.find({
        isActive: true,
        keywords: { $in: userSkills },
      })
        .sort({ crawledAt: -1 })
        .limit(limit)
        .select(
          'jobTitle companyName jobCategory experienceLevel region keywords salaryText'
        )
        .lean();

      // Calculate match score for each job
      const jobsWithScore = jobs.map((job) => {
        const matchingSkills = job.keywords.filter((skill) =>
          userSkills.some(
            (userSkill) =>
              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );

        const matchScore = Math.round(
          (matchingSkills.length /
            Math.max(job.keywords.length, userSkills.length)) *
            100
        );

        return {
          ...job,
          matchingSkills,
          matchScore,
        };
      });

      return jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      throw new Error('Failed to get job recommendations');
    }
  }
}

module.exports = new JobService();
