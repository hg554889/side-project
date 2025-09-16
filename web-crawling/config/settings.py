# ===========================================
# web-crawling/config/settings.py
# ===========================================
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # MongoDB 설정
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/skillmap')
    MONGODB_DB_NAME = 'skillmap'
    
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

# ===========================================
# web-crawling/config/sites_config.py
# ===========================================
SITES_CONFIG = {
    'saramin': {
        'base_url': 'https://www.saramin.co.kr',
        'search_path': '/zf_user/jobs/list/domestic',
        'selectors': {
            'job_list': '.item_recruit',
            'title': '.job_tit a',
            'company': '.corp_name a',
            'location': '.job_condition span:first-child',
            'experience': '.job_condition span:nth-child(2)',
            'salary': '.job_condition span:last-child',
            'deadline': '.job_date .date',
            'url': '.job_tit a',
            'tags': '.job_sector a'
        },
        'rate_limit': 3,
        'max_pages': 10
    },
    'comento': {
        'base_url': 'https://comento.kr',
        'search_path': '/career/dreamverse',
        'selectors': {
            'job_list': '[data-testid="job-card"]',
            'title': '.job-title',
            'company': '.company-name',
            'location': '.location',
            'experience': '.experience',
            'skills': '.skill-tag',
            'url': 'a'
        },
        'rate_limit': 4,
        'max_pages': 5
    },
    'jobkorea': {
        'base_url': 'https://www.jobkorea.co.kr',
        'search_path': '/recruit/joblist',
        'selectors': {
            'job_list': '.recruit-info',
            'title': '.post-list-corp-name a',
            'company': '.post-list-info .corp-name a',
            'conditions': '.post-list-info .option',
            'url': '.post-list-corp-name a'
        },
        'rate_limit': 3.5,
        'max_pages': 8
    },
    'securityfarm': {
        'base_url': 'https://securityfarm.co.kr',
        'search_path': '/job',
        'selectors': {
            'job_list': '.job-item',
            'title': '.job-title',
            'company': '.company-name',
            'location': '.location',
            'experience': '.experience',
            'skills': '.skill',
            'deadline': '.deadline',
            'url': 'a'
        },
        'rate_limit': 2,
        'max_pages': 5
    }
}

# ===========================================
# web-crawling/config/categories.py
# ===========================================
JOB_CATEGORIES = {
    'IT/개발': [
        'developer', '개발자', 'programmer', '프로그래머',
        'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드', '풀스택',
        'react', 'vue', 'angular', 'node.js', 'spring', 'django', 'python', 'java'
    ],
    '보안': [
        '보안', 'security', '침해대응', '보안관제', 'soc', '취약점',
        '포렌식', '정보보안', '네트워크보안', '인프라보안'
    ],
    '마케팅': [
        '마케팅', 'marketing', '광고', '브랜드', '퍼포먼스',
        'seo', 'sem', '콘텐츠', '디지털마케팅', '온라인마케팅'
    ],
    '디자인': [
        '디자인', 'design', 'ui', 'ux', '그래픽',
        'figma', 'adobe', 'photoshop', 'illustrator', '웹디자인'
    ],
    '기획': [
        '기획', 'pm', 'product manager', '서비스기획',
        '전략기획', '사업기획', 'planning', '프로덕트'
    ],
    '영업/세일즈': [
        '영업', '세일즈', 'sales', '기술영업',
        'b2b', 'b2c', '해외영업', '국내영업'
    ],
    '금융': [
        '금융', 'finance', '투자', '리스크', '회계',
        '재무', 'cpa', 'frm', '은행', '증권'
    ]
}

TECH_KEYWORDS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Spring', 'Django', 'Flask',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Elasticsearch',
    'Git', 'Jira', 'Figma', 'Adobe', 'Photoshop', 'Illustrator',
    'HTML', 'CSS', 'SQL', 'NoSQL', 'REST', 'GraphQL'
]

# ===========================================
# web-crawling/utils/logger.py  
# ===========================================
from loguru import logger
import sys
from pathlib import Path

def setup_logger():
    # 로그 디렉토리 생성
    log_dir = Path(__dirname__).parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # 기존 핸들러 제거
    logger.remove()
    
    # 콘솔 로그
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )
    
    # 파일 로그
    logger.add(
        log_dir / "crawler.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG",
        rotation="10 MB",
        retention="30 days"
    )
    
    return logger

# ===========================================
# web-crawling/database/mongo_client.py
# ===========================================
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

# ===========================================
# web-crawling/crawlers/base_crawler.py
# ===========================================
from abc import ABC, abstractmethod
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from bs4 import BeautifulSoup
import requests
import time
import hashlib
import re
import random
from config.settings import settings
from config.categories import JOB_CATEGORIES, TECH_KEYWORDS
from utils.logger import setup_logger

logger = setup_logger()

class BaseCrawler(ABC):
    def __init__(self, site_name, site_config):
        self.site_name = site_name
        self.config = site_config
        self.base_url = site_config['base_url']
        self.selectors = site_config['selectors']
        self.rate_limit = site_config.get('rate_limit', 3)
        self.driver = None
        
    def setup_driver(self):
        """Chrome 드라이버 설정"""
        options = Options()
        options.add_argument(f'--user-agent={random.choice(settings.USER_AGENTS)}')
        
        if settings.HEADLESS_BROWSER:
            options.add_argument('--headless')
        
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        try:
            self.driver = webdriver.Chrome(options=options)
            self.driver.set_page_load_timeout(settings.REQUEST_TIMEOUT)
            logger.info(f"{self.site_name}: Chrome 드라이버 초기화 완료")
        except WebDriverException as e:
            logger.error(f"{self.site_name}: 드라이버 초기화 실패 - {e}")
            raise
    
    def close_driver(self):
        """드라이버 종료"""
        if self.driver:
            self.driver.quit()
            self.driver = None
            logger.info(f"{self.site_name}: 드라이버 종료")
    
    @abstractmethod
    async def crawl(self, options=None):
        """크롤링 메인 메서드 - 하위 클래스에서 구현"""
        pass
    
    @abstractmethod
    def extract_job_data(self, element):
        """채용공고 데이터 추출 - 하위 클래스에서 구현"""
        pass
    
    def normalize_data(self, raw_data):
        """데이터 정규화"""
        return {
            'id': self.generate_id(raw_data.get('url', '')),
            'source': self.site_name,
            'url': raw_data.get('url', ''),
            
            'company_name': raw_data.get('company', '').strip(),
            'company_location': self.parse_location(raw_data.get('location', '')),
            
            'job_title': raw_data.get('title', '').strip(),
            'job_category': self.categorize_job(raw_data.get('title', ''), raw_data.get('tags', [])),
            'experience_level': self.normalize_experience(raw_data.get('experience', '')),
            
            'work_location': raw_data.get('location', '').strip(),
            'salary_range': self.parse_salary(raw_data.get('salary', '')),
            
            'keywords': self.extract_keywords(raw_data.get('title', ''), raw_data.get('tags', [])),
            'deadline': self.parse_date(raw_data.get('deadline', '')),
            'scraped_at': time.time(),
            'is_active': True
        }
    
    def generate_id(self, url):
        """URL 기반 고유 ID 생성"""
        return hashlib.md5(url.encode()).hexdigest()
    
    def categorize_job(self, title, skills=None):
        """직군 분류"""
        if skills is None:
            skills = []
            
        text = (title + ' ' + ' '.join(skills)).lower()
        
        for category, keywords in JOB_CATEGORIES.items():
            if any(keyword.lower() in text for keyword in keywords):
                return category
        
        return '기타'
    
    def normalize_experience(self, experience):
        """경험 수준 정규화"""
        exp = experience.lower()
        
        if any(word in exp for word in ['신입', 'entry', '0년']):
            return '신입'
        elif any(word in exp for word in ['1년', '2년', '3년']):
            return '1-3년차'
        elif '무관' in exp or 'any' in exp:
            return '경력무관'
        
        return '경력무관'
    
    def extract_keywords(self, title, skills=None):
        """키워드 추출"""
        if skills is None:
            skills = []
            
        text = title + ' ' + ' '.join(skills)
        extracted = []
        
        for keyword in TECH_KEYWORDS:
            if keyword.lower() in text.lower():
                extracted.append(keyword)
        
        # 중복 제거
        return list(set(extracted + skills))
    
    def parse_location(self, location_text):
        """위치 정규화"""
        location = location_text.strip()
        
        location_mapping = {
            '서울시': '서울',
            '서울특별시': '서울',
            '경기도': '경기',
            '부산시': '부산',
            '부산광역시': '부산',
            '재택근무': '재택',
            '원격근무': '재택'
        }
        
        return location_mapping.get(location, location)
    
    def parse_salary(self, salary_text):
        """급여 정보 파싱"""
        if not salary_text:
            return {'min': 0, 'max': 0, 'negotiable': True}
        
        # 숫자 추출
        numbers = re.findall(r'\d+', salary_text)
        if not numbers:
            return {'min': 0, 'max': 0, 'negotiable': True}
        
        nums = [int(n) for n in numbers]
        
        return {
            'min': min(nums) * 10000 if nums else 0,  # 만원 -> 원
            'max': max(nums) * 10000 if nums else 0,
            'negotiable': any(word in salary_text for word in ['협의', '면접', '상담'])
        }
    
    def parse_date(self, date_text):
        """날짜 파싱"""
        if not date_text or '상시' in date_text:
            return None
        
        if '마감' in date_text:
            return time.time()
        
        # YYYY-MM-DD 형식 찾기
        date_match = re.search(r'(\d{4})[-.](\d{1,2})[-.](\d{1,2})', date_text)
        if date_match:
            year, month, day = date_match.groups()
            try:
                import datetime
                dt = datetime.datetime(int(year), int(month), int(day))
                return dt.timestamp()
            except ValueError:
                return None
        
        return None
    
    def wait_and_find_element(self, by, value, timeout=10):
        """요소 대기 및 찾기"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            logger.warning(f"{self.site_name}: 요소를 찾을 수 없음 - {value}")
            return None
    
    def scroll_to_load_more(self, max_scrolls=5):
        """페이지 스크롤하여 더 많은 콘텐츠 로드"""
        for i in range(max_scrolls):
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # 새로운 콘텐츠가 로드되었는지 확인
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if i > 0 and new_height == last_height:
                break
            last_height = new_height
    
    def delay(self):
        """요청 간 대기"""
        time.sleep(self.rate_limit + random.uniform(0, 1))

# ===========================================
# web-crawling/crawlers/saramin_crawler.py
# ===========================================
from .base_crawler import BaseCrawler
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from config.sites_config import SITES_CONFIG
from utils.logger import setup_logger
import time

logger = setup_logger()

class SaraminCrawler(BaseCrawler):
    def __init__(self):
        super().__init__('saramin', SITES_CONFIG['saramin'])
    
    async def crawl(self, options=None):
        if options is None:
            options = {}
        
        keyword = options.get('keyword', '')
        category = options.get('category', '')
        experience_level = options.get('experience_level', '')
        max_jobs = options.get('max_jobs', 50)
        
        jobs = []
        
        try:
            self.setup_driver()
            
            # 검색 URL 구성
            search_params = {
                'recruitFilterType': 'domestic',
                'searchType': 'search',
                'searchword': keyword,
                'cat_kewd': category,
                'exp_cd': self.map_experience_level(experience_level)
            }
            
            # URL 생성
            params_str = '&'.join([f"{k}={v}" for k, v in search_params.items() if v])
            url = f"{self.base_url}{self.config['search_path']}?{params_str}"
            
            logger.info(f"사람인 크롤링 시작: {url}")
            
            self.driver.get(url)
            
            # 채용공고 리스트 대기
            job_list_element = self.wait_and_find_element(By.CSS_SELECTOR, self.selectors['job_list'])
            if not job_list_element:
                logger.warning("채용공고 목록을 찾을 수 없습니다.")
                return jobs
            
            # 페이지 스크롤 (더 많은 공고 로드)
            self.scroll_to_load_more(3)
            
            # 모든 채용공고 요소 찾기
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, self.selectors['job_list'])
            logger.info(f"사람인: {len(job_elements)}개 채용공고 발견")
            
            for i, element in enumerate(job_elements[:max_jobs]):
                try:
                    raw_data = self.extract_job_data(element)
                    if raw_data and raw_data.get('title') and raw_data.get('company'):
                        normalized_data = self.normalize_data(raw_data)
                        jobs.append(normalized_data)
                        logger.debug(f"사람인: {i+1}번째 공고 추출 완료 - {raw_data.get('title')}")
                    
                except Exception as e:
                    logger.warning(f"사람인: {i+1}번째 공고 추출 실패 - {e}")
                    continue
            
            logger.info(f"사람인: 총 {len(jobs)}개 채용공고 수집 완료")
            
        except Exception as e:
            logger.error(f"사람인 크롤링 실패: {e}")
            raise
        
        finally:
            self.close_driver()
            self.delay()
        
        return jobs
    
    def extract_job_data(self, element):
        """개별 채용공고 데이터 추출"""
        try:
            # 제목
            title_elem = element.find_element(By.CSS_SELECTOR, self.selectors['title'])
            title = title_elem.text.strip() if title_elem else ''
            url = title_elem.get_attribute('href') if title_elem else ''
            
            # 회사명
            company_elem = element.find_element(By.CSS_SELECTOR, self.selectors['company'])
            company = company_elem.text.strip() if company_elem else ''
            
            # 위치, 경험, 급여
            condition_elements = element.find_elements(By.CSS_SELECTOR, '.job_condition span')
            location = condition_elements[0].text.strip() if len(condition_elements) > 0 else ''
            experience = condition_elements[1].text.strip() if len(condition_elements) > 1 else ''
            salary = condition_elements[2].text.strip() if len(condition_elements) > 2 else ''
            
            # 마감일
            try:
                deadline_elem = element.find_element(By.CSS_SELECTOR, self.selectors['deadline'])
                deadline = deadline_elem.text.strip() if deadline_elem else ''
            except NoSuchElementException:
                deadline = ''
            
            # 태그/스킬
            try:
                tag_elements = element.find_elements(By.CSS_SELECTOR, self.selectors['tags'])
                tags = [tag.text.strip() for tag in tag_elements if tag.text.strip()]
            except NoSuchElementException:
                tags = []
            
            return {
                'title': title,
                'company': company,
                'location': location,
                'experience': experience,
                'salary': salary,
                'deadline': deadline,
                'url': url,
                'tags': tags
            }
            
        except Exception as e:
            logger.warning(f"사람인: 데이터 추출 실패 - {e}")
            return None
    
    def map_experience_level(self, level):
        """경험 수준 매핑"""
        mapping = {
            '신입': '1',
            '1-3년차': '2',
            '경력무관': '0'
        }
        return mapping.get(level, '0')

# ===========================================
# web-crawling/processors/data_normalizer.py
# ===========================================
from typing import List, Dict, Any
import re
from utils.logger import setup_logger
from database.mongo_client import mongo_client

logger = setup_logger()

class DataNormalizer:
    def __init__(self):
        self.company_mapper = CompanyNameMapper()
        self.location_normalizer = LocationNormalizer()
        self.skills_normalizer = SkillsNormalizer()
        self.salary_normalizer = SalaryNormalizer()
    
    async def normalize(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 정규화 메인 메서드"""
        normalized = raw_job.copy()
        
        try:
            # 1. 회사명 정규화
            if 'company_name' in normalized:
                normalized['company_name'] = await self.company_mapper.normalize(
                    normalized['company_name']
                )
            
            # 2. 위치 정규화
            if 'work_location' in normalized:
                normalized['work_location'] = self.location_normalizer.normalize(
                    normalized['work_location']
                )
            
            # 3. 스킬/키워드 정규화
            if 'keywords' in normalized:
                normalized['keywords'] = self.skills_normalizer.normalize(
                    normalized['keywords']
                )
            
            # 4. 급여 정규화
            if 'salary_range' in normalized:
                normalized['salary_range'] = self.salary_normalizer.normalize(
                    normalized['salary_range']
                )
            
            # 5. 직군 분류 개선
            normalized['job_category'] = await self.improve_job_categorization(normalized)
            
            # 6. 품질 점수 계산
            normalized['quality_score'] = self.calculate_quality_score(normalized)
            
            return normalized
            
        except Exception as e:
            logger.error(f"데이터 정규화 실패: {e}")
            return {**raw_job, 'quality_score': 0.3, 'normalization_error': str(e)}
    
    def calculate_quality_score(self, job: Dict[str, Any]) -> float:
        """데이터 품질 점수 계산"""
        score = 0
        max_score = 0
        
        # 필수 필드 검사
        required_fields = ['job_title', 'company_name', 'job_category']
        for field in required_fields:
            max_score += 20
            if job.get(field) and str(job[field]).strip():
                score += 20
        
        # 선택 필드 검사
        optional_fields = ['work_location', 'keywords', 'salary_range']
        for field in optional_fields:
            max_score += 10
            value = job.get(field)
            if value and (isinstance(value, list) and len(value) > 0 or value):
                score += 10
        
        # 키워드 풍부도
        max_score += 30
        keywords = job.get('keywords', [])
        if isinstance(keywords, list) and len(keywords) >= 3:
            score += 30
        elif isinstance(keywords, list) and len(keywords) >= 1:
            score += 15
        
        return min(score / max_score, 1.0) if max_score > 0 else 0.0
    
    async def improve_job_categorization(self, job: Dict[str, Any]) -> str:
        """AI를 사용한 더 정확한 직군 분류"""
        context = ' '.join([
            job.get('job_title', ''),
            ' '.join(job.get('keywords', [])),
        ]).strip()
        
        # 기존 카테고리 신뢰도 검증
        current_category = job.get('job_category', '기타')
        confidence = self.get_category_confidence(current_category, context)
        
        if confidence < 0.7:
            # 신뢰도가 낮으면 재분류
            return self.reclassify_job(context)
        
        return current_category
    
    def get_category_confidence(self, category: str, context: str) -> float:
        """카테고리 신뢰도 계산"""
        from config.categories import JOB_CATEGORIES
        
        keywords = JOB_CATEGORIES.get(category, [])
        if not keywords:
            return 0.0
        
        context_lower = context.lower()
        matches = sum(1 for keyword in keywords if keyword.lower() in context_lower)
        
        return min(matches / len(keywords), 1.0)
    
    def reclassify_job(self, context: str) -> str:
        """키워드 기반 재분류"""
        from config.categories import JOB_CATEGORIES
        
        best_category = '기타'
        max_score = 0
        
        context_lower = context.lower()
        
        for category, keywords in JOB_CATEGORIES.items():
            score = sum(1 for keyword in keywords if keyword.lower() in context_lower)
            if score > max_score:
                max_score = score
                best_category = category
        
        return best_category

class CompanyNameMapper:
    def __init__(self):
        self.aliases = self._load_company_aliases()
    
    def _load_company_aliases(self):
        """회사명 별칭 매핑 로드"""
        return {
            '삼성전자': ['삼성전자주식회사', 'Samsung Electronics', 'SEC'],
            '네이버': ['NAVER', '네이버주식회사', 'NAVER Corp'],
            '카카오': ['Kakao', '주식회사카카오', 'Kakao Corp'],
            'LG전자': ['LG Electronics', 'LG전자주식회사'],
            '현대자동차': ['현대자동차주식회사', 'Hyundai Motor'],
        }
    
    async def normalize(self, company_name: str) -> str:
        """회사명 정규화"""
        if not company_name:
            return ''
        
        # 1. 기본 정리
        normalized = company_name.strip()
        normalized = re.sub(r'주식회사|㈜|\(주\)', '', normalized)
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        # 2. 별칭 매핑
        for canonical, aliases in self.aliases.items():
            if normalized.lower() in [alias.lower() for alias in aliases]:
                return canonical
        
        return normalized

class LocationNormalizer:
    def __init__(self):
        self.location_mapping = {
            '서울시': '서울',
            '서울특별시': '서울',
            '경기도': '경기',
            '부산시': '부산',
            '부산광역시': '부산',
            '재택근무': '재택',
            '원격근무': '재택',
        }
    
    def normalize(self, location: str) -> str:
        """위치 정규화"""
        if not location:
            return ''
        
        normalized = location.strip()
        
        # 매핑 테이블 적용
        mapped = self.location_mapping.get(normalized)
        if mapped:
            return mapped
        
        # 패턴 매칭
        if '강남' in normalized and '서울' not in normalized:
            return '서울 강남구'
        
        if '판교' in normalized and '경기' not in normalized:
            return '경기 성남 판교'
        
        return re.sub(r'시$|구$|동$', '', normalized).strip()

class SkillsNormalizer:
    def __init__(self):
        self.skill_mappings = {
            'js': 'JavaScript',
            'ts': 'TypeScript',
            'python': 'Python',
            'python3': 'Python',
            'react.js': 'React',
            'reactjs': 'React',
            'vue.js': 'Vue.js',
            'vuejs': 'Vue.js',
            'node.js': 'Node.js',
            'nodejs': 'Node.js',
            'aws': 'AWS',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL',
            'postgres': 'PostgreSQL',
            'mongodb': 'MongoDB',
            'mongo': 'MongoDB',
        }
    
    def normalize(self, skills: List[str]) -> List[str]:
        """스킬 정규화"""
        if not isinstance(skills, list):
            skills = [skills] if skills else []
        
        normalized = []
        for skill in skills:
            if not skill:
                continue
            
            cleaned = skill.strip().lower()
            mapped_skill = self.skill_mappings.get(cleaned, skill.strip())
            
            if len(mapped_skill) > 1 and mapped_skill not in normalized:
                normalized.append(mapped_skill)
        
        return normalized

class SalaryNormalizer:
    def normalize(self, salary_range: Dict[str, Any]) -> Dict[str, Any]:
        """급여 정규화"""
        if not isinstance(salary_range, dict):
            return {'min': 0, 'max': 0, 'negotiable': True}
        
        min_val = self._parse_salary(salary_range.get('min', 0))
        max_val = self._parse_salary(salary_range.get('max', 0))
        negotiable = salary_range.get('negotiable', True)
        
        # 범위 검증
        if min_val > max_val and max_val > 0:
            min_val, max_val = max_val, min_val
        
        # 현실적이지 않은 값 필터링
        if min_val > 200000000:  # 2억 초과
            min_val = 0
        if max_val > 200000000:
            max_val = 0
        
        return {
            'min': max(0, min_val),
            'max': max(0, max_val),
            'negotiable': bool(negotiable)
        }
    
    def _parse_salary(self, value) -> int:
        """급여 값 파싱"""
        if isinstance(value, (int, float)):
            return int(value)
        
        if not value:
            return 0
        
        # 문자열에서 숫자 추출
        numbers = re.findall(r'\d+', str(value))
        return int(numbers[0]) if numbers else 0

# ===========================================
# web-crawling/main.py
# ===========================================
import asyncio
import argparse
import json
from typing import Dict, List, Any
from crawlers.saramin_crawler import SaraminCrawler
from processors.data_normalizer import DataNormalizer
from database.mongo_client import mongo_client
from utils.logger import setup_logger

logger = setup_logger()

class CrawlingManager:
    def __init__(self):
        self.crawlers = {
            'saramin': SaraminCrawler(),
            # 다른 크롤러들 추가 예정
        }
        self.normalizer = DataNormalizer()
    
    async def crawl_all(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """모든 사이트 크롤링"""
        logger.info("🚀 통합 크롤링 시작...")
        
        results = {
            'sites': {},
            'total': {
                'crawled': 0,
                'processed': 0,
                'saved': 0,
                'errors': 0
            }
        }
        
        sites = options.get('sites', ['saramin'])
        
        for site_name in sites:
            if site_name not in self.crawlers:
                logger.warning(f"지원하지 않는 사이트: {site_name}")
                continue
            
            try:
                logger.info(f"📡 {site_name} 크롤링 시작...")
                
                crawler = self.crawlers[site_name]
                raw_jobs = await crawler.crawl(options)
                
                processed_jobs = []
                for raw_job in raw_jobs:
                    try:
                        normalized_job = await self.normalizer.normalize(raw_job)
                        if normalized_job.get('quality_score', 0) >= 0.5:
                            processed_jobs.append(normalized_job)
                    except Exception as e:
                        logger.warning(f"데이터 처리 실패: {e}")
                        results['total']['errors'] += 1
                
                # MongoDB에 저장
                saved_count = await self.save_jobs(processed_jobs)
                
                site_result = {
                    'crawled': len(raw_jobs),
                    'processed': len(processed_jobs),
                    'saved': saved_count
                }
                
                results['sites'][site_name] = site_result
                results['total']['crawled'] += len(raw_jobs)
                results['total']['processed'] += len(processed_jobs)
                results['total']['saved'] += saved_count
                
                logger.info(f"✅ {site_name}: {saved_count}개 저장 완료")
                
            except Exception as e:
                logger.error(f"❌ {site_name} 크롤링 실패: {e}")
                results['sites'][site_name] = {'error': str(e)}
                results['total']['errors'] += 1
        
        logger.info(f"🎉 통합 크롤링 완료! 총 {results['total']['saved']}개 저장")
        return results
    
    async def save_jobs(self, jobs: List[Dict[str, Any]]) -> int:
        """채용공고 MongoDB에 저장"""
        if not jobs:
            return 0
        
        try:
            collection = mongo_client.get_collection('job_postings')
            saved_count = 0
            
            for job in jobs:
                # Upsert (있으면 업데이트, 없으면 삽입)
                result = collection.update_one(
                    {'id': job['id']},
                    {'$set': job},
                    upsert=True
                )
                
                if result.upserted_id or result.modified_count > 0:
                    saved_count += 1
            
            return saved_count
            
        except Exception as e:
            logger.error(f"MongoDB 저장 실패: {e}")
            return 0
    
    async def get_system_health(self) -> Dict[str, Any]:
        """시스템 상태 확인"""
        try:
            collection = mongo_client.get_collection('job_postings')
            
            # 기본 통계
            total_jobs = collection.count_documents({})
            recent_jobs = collection.count_documents({
                'scraped_at': {'$gte': time.time() - 86400}  # 최근 24시간
            })
            
            # 품질 통계
            quality_pipeline = [
                {
                    '$group': {
                        '_id': None,
                        'avg_quality': {'$avg': '$quality_score'},
                        'low_quality_count': {
                            '$sum': {
                                '$cond': [{'$lt': ['$quality_score', 0.5]}, 1, 0]
                            }
                        }
                    }
                }
            ]
            
            quality_stats = list(collection.aggregate(quality_pipeline))
            quality_data = quality_stats[0] if quality_stats else {}
            
            return {
                'database': {
                    'status': 'healthy',
                    'total_jobs': total_jobs,
                    'recent_jobs': recent_jobs
                },
                'data_quality': {
                    'average_score': round(quality_data.get('avg_quality', 0), 3),
                    'low_quality_count': quality_data.get('low_quality_count', 0)
                }
            }
            
        except Exception as e:
            logger.error(f"시스템 상태 확인 실패: {e}")
            return {
                'database': {'status': 'error', 'error': str(e)},
                'data_quality': {'average_score': 0, 'low_quality_count': 0}
            }

async def main():
    """메인 실행 함수"""
    parser = argparse.ArgumentParser(description='SkillMap 크롤링 시스템')
    parser.add_argument('--sites', default='saramin', help='크롤링할 사이트')
    parser.add_argument('--keyword', default='React', help='검색 키워드')
    parser.add_argument('--category', default='IT/개발', help='직군 카테고리')
    parser.add_argument('--experience', default='신입', help='경험 수준')
    parser.add_argument('--max-jobs', type=int, default=50, help='최대 채용공고 수')
    parser.add_argument('--output', help='결과를 JSON 파일로 저장')
    
    args = parser.parse_args()
    
    manager = CrawlingManager()
    
    options = {
        'sites': args.sites.split(','),
        'keyword': args.keyword,
        'category': args.category,
        'experience_level': args.experience,
        'max_jobs': args.max_jobs
    }
    
    try:
        results = await manager.crawl_all(options)
        
        print(f"\n📊 크롤링 결과:")
        print(f"  총 크롤링: {results['total']['crawled']}개")
        print(f"  처리완료: {results['total']['processed']}개")
        print(f"  저장완료: {results['total']['saved']}개")
        print(f"  오류발생: {results['total']['errors']}개")
        
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"\n💾 결과가 {args.output}에 저장되었습니다.")
        
    except KeyboardInterrupt:
        print("\n⏹️ 사용자에 의해 중단됨")
    except Exception as e:
        logger.error(f"크롤링 실행 실패: {e}")
    finally:
        mongo_client.close()

if __name__ == '__main__':
    import time
    asyncio.run(main())