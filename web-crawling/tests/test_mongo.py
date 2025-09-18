import asyncio
import sys
import os

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.mongo_client import mongo_client
from utils.logger import setup_logger

logger = setup_logger("mongo_test")

async def test_connection():
    try:
        # 연결 테스트
        collection = mongo_client.get_collection('test_collection')
        
        # 테스트 데이터 삽입
        result = await collection.insert_one({
            "test": "connection",
            "timestamp": "2024-03-18"
        })
        
        logger.info(f"테스트 문서 삽입됨: {result.inserted_id}")
        
        # 데이터 조회
        doc = await collection.find_one({"test": "connection"})
        logger.info(f"조회된 문서: {doc}")
        
        # 테스트 데이터 정리
        await collection.delete_many({"test": "connection"})
        logger.info("테스트 데이터 정리 완료")
        
        return True
        
    except Exception as e:
        logger.error(f"MongoDB 테스트 실패: {e}")
        return False
    
    finally:
        mongo_client.close()

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    exit(0 if success else 1)