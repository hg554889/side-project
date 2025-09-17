from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from config.settings import settings
from utils.logger import setup_logger

logger = setup_logger()

class MongoDBClient:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def connect(self):
        if self._client is None:
            try:
                self._client = MongoClient(settings.MONGODB_URI)
                self._db = self._client[settings.MONGODB_DB_NAME]
                # 연결 테스트
                self._client.admin.command('ping')
                logger.info(f"MongoDB 연결 성공: {settings.MONGODB_DB_NAME}")
            except ConnectionFailure as e:
                logger.error(f"MongoDB 연결 실패: {e}")
                raise
        return self._db
    
    def get_collection(self, collection_name):
        db = self.connect()
        return db[collection_name]
    
    def close(self):
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("MongoDB 연결 종료")

# 싱글톤 인스턴스
mongo_client = MongoDBClient()