import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # MongoDB 설정
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/Side_Project')
    MONGODB_DB_NAME = 'Side_Project'
    
    # Redis 설정
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
    
    # 크롤링 설정
    CRAWL_DELAY = int(os.getenv('CRAWL_DELAY', 3))  # 초
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', 3))
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 30))
    HEADLESS_BROWSER = os.getenv('HEADLESS_BROWSER', 'true').lower() == 'true'
    
    # 품질 관리
    MIN_QUALITY_SCORE = float(os.getenv('MIN_QUALITY_SCORE', 0.5))
    MAX_SIMILARITY_SCORE = float(os.getenv('MAX_SIMILARITY_SCORE', 0.8))
    
    # User Agents
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]

settings = Settings()