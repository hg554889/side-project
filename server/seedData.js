const mongoose = require('mongoose');
const { seedTestData } = require('./utils/seedTestData');
require('dotenv').config();

async function runSeed() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB');

    // 테스트 데이터 시드
    await seedTestData();

    console.log('🌱 Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();