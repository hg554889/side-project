from motor.motor_asyncio import AsyncIOMotorClient
from utils.logger import setup_logger

logger = setup_logger("mongodb")

class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()

    def connect(self):
        try:
            # MongoDB 연결 설정
            self.client = AsyncIOMotorClient('mongodb://localhost:27017')
            self.db = self.client['skillmap']
            logger.info("MongoDB 연결 성공")
        except Exception as e:
            logger.error(f"MongoDB 연결 실패: {e}")
            raise

    def get_collection(self, collection_name):
        return self.db[collection_name]

    def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB 연결 종료")

mongo_client = MongoDBClient()