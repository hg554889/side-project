const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Global MongoDB connection
let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('🔗 Connected to MongoDB');
  }
}

app.get('/jobs', async (req, res) => {
  try {
    console.log('🔥 Jobs endpoint called!');

    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('job_postings');

    const { limit = 20, page = 1 } = req.query;
    const limitNum = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNum;

    const [jobs, totalCount] = await Promise.all([
      collection.find({ is_active: true })
        .sort({ scraped_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      collection.countDocuments({ is_active: true })
    ]);

    console.log('Found jobs:', jobs.length);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        tags: job.tags || [],
        category: job.job_category,
        url: job.url,
        experience: job.experience,
        deadline: job.deadline
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs: totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/test', async (req, res) => {
  try {
    console.log('🔥 Test server endpoint called!');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('job_postings');

    const totalCount = await collection.countDocuments({});
    const activeCount = await collection.countDocuments({ is_active: true });
    const jobs = await collection.find({ is_active: true }).limit(5).toArray();

    console.log('Total jobs:', totalCount);
    console.log('Active jobs:', activeCount);

    res.json({
      success: true,
      totalJobs: totalCount,
      activeJobs: activeCount,
      sampleJobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        category: job.job_category
      }))
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    res.json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('🧪 Test server running on http://localhost:3001');
  console.log('Test endpoint: http://localhost:3001/test');
});