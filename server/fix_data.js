const mongoose = require('mongoose');
require('dotenv').config();

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('job_postings');

    // Update is_active field
    console.log('Setting is_active = true for all jobs...');
    const result = await collection.updateMany({}, { $set: { is_active: true } });
    console.log('Updated', result.modifiedCount, 'jobs');

    // Check active count
    const activeCount = await collection.countDocuments({ is_active: true });
    console.log('Active jobs now:', activeCount);

    // Show sample job
    const sample = await collection.findOne({ is_active: true });
    console.log('Sample job title:', sample?.title);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixData();