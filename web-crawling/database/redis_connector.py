import os
import redis
from dotenv import load_dotenv
from utils.logger import setup_logger

logger = setup_logger("redis_connector")

load_dotenv()

class RedisConnector:
    def __init__(self):
        self.redis_client = None
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", 6379))
        self.redis_db = int(os.getenv("REDIS_DB", 0))

    def connect(self):
        try:
            self.redis_client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                db=self.redis_db,
                decode_responses=True  # Decode responses to Python strings
            )
            self.redis_client.ping()
            logger.info("Redis에 성공적으로 연결되었습니다.")
        except redis.exceptions.ConnectionError as e:
            logger.error(f"Redis 연결 실패: {e}")
            self.redis_client = None

    def close(self):
        if self.redis_client:
            self.redis_client.close()
            logger.info("Redis 연결이 종료되었습니다.")

    def add_to_queue(self, queue_name: str, item: str):
        if self.redis_client:
            self.redis_client.rpush(queue_name, item)
        else:
            logger.warning("Redis에 연결되지 않아 큐에 추가할 수 없습니다.")

    def get_from_queue(self, queue_name: str, timeout: int = 0):
        if self.redis_client:
            # BLPOP is a blocking pop operation
            item = self.redis_client.blpop(queue_name, timeout=timeout)
            return item[1] if item else None
        else:
            logger.warning("Redis에 연결되지 않아 큐에서 가져올 수 없습니다.")
            return None

    def add_visited_url(self, set_name: str, url: str):
        if self.redis_client:
            self.redis_client.sadd(set_name, url)
        else:
            logger.warning("Redis에 연결되지 않아 방문 URL을 추가할 수 없습니다.")

    def is_url_visited(self, set_name: str, url: str) -> bool:
        if self.redis_client:
            return self.redis_client.sismember(set_name, url)
        else:
            logger.warning("Redis에 연결되지 않아 방문 URL 여부를 확인할 수 없습니다.")
            return False

# Create a single instance to be used throughout the application
redis_connector = RedisConnector()
