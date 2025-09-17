# test_mongodb_connection.py
from database.mongo_client import mongo_client

try:
    # 연결 테스트
    db = mongo_client.connect()
    print(f"MongoDB 연결 성공! 데이터베이스: {db.name}")
    
    # 컬렉션 생성 및 테스트
    collection = mongo_client.get_collection('job_postings')
    
    # 테스트 데이터 삽입
    test_job = {
        "title": "테스트 React 개발자",
        "company": "테스트 회사",
        "source": "test"
    }
    
    result = collection.insert_one(test_job)
    print(f"테스트 데이터 삽입 성공: {result.inserted_id}")
    
    # 확인
    count = collection.count_documents({})
    print(f"현재 문서 수: {count}")
    
except Exception as e:
    print(f"연결 실패: {e}")