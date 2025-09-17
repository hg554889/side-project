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
        last_height = 0
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