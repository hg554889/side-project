// MongoDB 초기화 스크립트
db = db.getSiblingDB('skillmap');

// 컬렉션 생성
db.createCollection('job_postings');

// 인덱스 생성 (성능 최적화)
db.job_postings.createIndex({ "id": 1 }, { unique: true });
db.job_postings.createIndex({ "title": "text", "company": "text", "description": "text" });
db.job_postings.createIndex({ "category": 1 });
db.job_postings.createIndex({ "experience_level": 1 });
db.job_postings.createIndex({ "scraped_at": 1 });
db.job_postings.createIndex({ "quality_score": 1 });

print('MongoDB 초기화 완료 - 컬렉션 및 인덱스 생성됨');