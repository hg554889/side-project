import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from utils.logger import setup_logger

logger = setup_logger("mongodb_connector")

load_dotenv()

class MongoDBConnector:
    def __init__(self):
        self.client = None
        self.db = None
        self.mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.db_name = os.getenv("MONGODB_DB_NAME", "job_crawler")

    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            logger.info("MongoDB에 성공적으로 연결되었습니다.")
        except Exception as e:
            logger.error(f"MongoDB 연결 실패: {e}")

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB 연결이 종료되었습니다.")

    async def insert_job_posting(self, job_data: dict):
        if self.db is None:
            await self.connect()
        
        # Add deduplication logic here later
        collection = self.db.job_postings
        await collection.insert_one(job_data)

# Create a single instance to be used throughout the application
mongodb_connector = MongoDBConnector()
