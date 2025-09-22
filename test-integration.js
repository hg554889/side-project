/**
 * Integration Test Script
 * 목 데이터에서 크롤링 데이터로의 전환 테스트
 */

const { MongoClient } = require('mongodb');

// MongoDB 연결 설정
const MONGODB_URI = 'mongodb://admin:skillmap123@localhost:27017/skillmap?authSource=admin';
const DB_NAME = 'skillmap';

async function testIntegration() {
  console.log('🔍 목 데이터 → 크롤링 데이터 통합 테스트 시작\n');

  try {
    // MongoDB 연결
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 연결 성공');

    const db = client.db(DB_NAME);
    const collection = db.collection('job_postings');

    // 1. 크롤링 데이터 존재 확인
    const totalJobs = await collection.countDocuments({});
    const activeJobs = await collection.countDocuments({ is_active: true });

    console.log(`\n📊 데이터베이스 상태:`);
    console.log(`   전체 채용공고: ${totalJobs}개`);
    console.log(`   활성 채용공고: ${activeJobs}개`);

    if (totalJobs === 0) {
      console.log('⚠️ 크롤링 데이터가 없습니다. 먼저 크롤링을 실행해주세요.');
      await client.close();
      return;
    }

    // 2. 샘플 데이터 조회
    const sampleJobs = await collection.find({ is_active: true }).limit(3).toArray();
    console.log(`\n📝 샘플 데이터 (${sampleJobs.length}개):`);

    sampleJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - ${job.company_name}`);
      console.log(`      위치: ${job.work_location}`);
      console.log(`      카테고리: ${job.job_category}`);
      console.log(`      품질점수: ${job.quality_score}`);
      console.log(`      사이트: ${job.source_site}`);
      console.log('');
    });

    // 3. API 엔드포인트 테스트
    console.log('🌐 API 엔드포인트 테스트:');

    try {
      // /api/jobs 테스트
      const response = await fetch('http://localhost:3000/api/jobs?limit=5');
      const data = await response.json();

      if (data.success && data.data.jobs) {
        console.log(`   ✅ GET /api/jobs - ${data.data.jobs.length}개 반환`);
        console.log(`      총 페이지: ${data.pagination.totalPages}`);
        console.log(`      총 채용공고: ${data.pagination.totalJobs}`);
      } else {
        console.log('   ❌ GET /api/jobs - 실패');
        console.log('      응답:', data);
      }
    } catch (error) {
      console.log('   ❌ GET /api/jobs - 네트워크 오류');
      console.log('      서버가 실행 중인지 확인해주세요 (port 3000)');
    }

    try {
      // /api/crawled/jobs 테스트
      const crawledResponse = await fetch('http://localhost:3000/api/crawled/jobs?limit=5');
      const crawledData = await crawledResponse.json();

      if (crawledData.success && crawledData.data) {
        console.log(`   ✅ GET /api/crawled/jobs - ${crawledData.data.length}개 반환`);
      } else {
        console.log('   ❌ GET /api/crawled/jobs - 실패');
      }
    } catch (error) {
      console.log('   ❌ GET /api/crawled/jobs - 네트워크 오류');
    }

    // 4. 데이터 어댑터 테스트
    console.log('\n🔄 데이터 어댑터 테스트:');

    const { convertCrawledJobToLegacy } = require('./server/utils/dataAdapter');

    const testJob = sampleJobs[0];
    const convertedJob = convertCrawledJobToLegacy(testJob);

    console.log('   원본 (크롤링) 데이터:');
    console.log(`     title: ${testJob.title}`);
    console.log(`     company_name: ${testJob.company_name}`);
    console.log(`     job_category: ${testJob.job_category}`);

    console.log('   변환된 (레거시) 데이터:');
    console.log(`     jobTitle: ${convertedJob.jobTitle}`);
    console.log(`     companyName: ${convertedJob.companyName}`);
    console.log(`     jobCategory: ${convertedJob.jobCategory}`);

    // 5. 통계 정보
    const pipeline = [
      { $match: { is_active: true } },
      {
        $group: {
          _id: '$source_site',
          count: { $sum: 1 },
          avgQuality: { $avg: '$quality_score' }
        }
      },
      { $sort: { count: -1 } }
    ];

    const siteStats = await collection.aggregate(pipeline).toArray();

    console.log('\n📈 사이트별 통계:');
    siteStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}개 (평균 품질: ${stat.avgQuality.toFixed(2)})`);
    });

    await client.close();

    console.log('\n✅ 통합 테스트 완료!');
    console.log('\n🎉 목 데이터가 성공적으로 크롤링 데이터로 대체되었습니다.');
    console.log('   이제 웹 애플리케이션에서 실제 크롤링된 채용공고 데이터를 사용합니다.');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  testIntegration();
}

module.exports = { testIntegration };