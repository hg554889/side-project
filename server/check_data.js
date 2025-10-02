const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;
    const collection = db.collection('job_postings');

    // Get a sample job
    const sample = await collection.findOne({ is_active: true });
    console.log('Sample job data:');
    console.log(JSON.stringify(sample, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();