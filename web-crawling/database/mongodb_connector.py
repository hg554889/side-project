import os
import httpx
from dotenv import load_dotenv
from utils.logger import setup_logger
from motor.motor_asyncio import AsyncIOMotorClient

logger = setup_logger("mongodb")

class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()

    def connect(self):
        try:
            # 환경 변수에서 MONGO_URI를 읽어옵니다.
            # 환경 변수가 없으면 기본값으로 'mongodb://mongo:27017'를 사용합니다.
            mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017")
            self.client = AsyncIOMotorClient(mongo_uri)
            self.db = self.client['skillmap']
            logger.info("MongoDB 연결 성공")
        except Exception as e:
            logger.error(f"MongoDB 연결 실패: {e}")
            raise

mongo_client = MongoDBClient()

load_dotenv()

class MongoDBConnector:
    def __init__(self):
        self.server_api_url = os.getenv("SERVER_API_URL", "http://localhost:3000/api")
        self.internal_api_token = os.getenv("INTERNAL_API_TOKEN")

    async def send_jobs_to_server(self, jobs_data: list):
        if not self.internal_api_token:
            logger.error("INTERNAL_API_TOKEN is not set. Cannot send data to server.")
            return

        headers = {
            "Content-Type": "application/json",
            "x-internal-token": self.internal_api_token,
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.server_api_url}/jobs/bulk",
                    json={"jobs": jobs_data},
                    headers=headers,
                    timeout=30.0,
                )
                response.raise_for_status()
                logger.info(f"Successfully sent {len(jobs_data)} jobs to the server.")
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
            except httpx.RequestError as e:
                logger.error(f"An error occurred while requesting {e.request.url!r}: {e}")

# Create a single instance to be used throughout the application
mongodb_connector = MongoDBConnector()