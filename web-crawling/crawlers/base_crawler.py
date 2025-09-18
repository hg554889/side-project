from abc import ABC, abstractmethod
from typing import List, Dict
from dataclasses import dataclass
import asyncio
import json
import os
import random
from dotenv import load_dotenv
import google.generativeai as genai
import google.api_core.exceptions
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from bs4 import BeautifulSoup
import requests
import aiohttp
import time
import hashlib
import re
from config.settings import settings
from config.categories import JOB_CATEGORIES, TECH_KEYWORDS
from config.sites_config import SITES_CONFIG
from config.categories import JOB_CATEGORIES  # Add this import
from database.mongodb_connector import mongodb_connector
from database.redis_connector import redis_connector
# 로거 설정
from utils.logger import setup_logger
logger = setup_logger("base_crawler")

# 환경변수 로드
load_dotenv()

# Gemini API 키 확인
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

class BaseCrawler(ABC):
    """기본 크롤러 클래스"""
    
    def __init__(self, site_name, site_config):
        self.site_name = site_name
        self.site_config = site_config
        self.logger = setup_logger(f"crawler_{site_name}")
        self.setup_driver()
        
    def setup_driver(self):
        """웹드라이버 초기화"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless=new')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
            
            # Selenium Manager will automatically handle the driver
            service = Service()
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.set_page_load_timeout(30)
            
            self.logger.info("웹드라이버 초기화 완료")
            return True
            
        except Exception as e:
            self.logger.warning(f"Chrome 드라이버 초기화 실패: {e}")
            return False

    def close_driver(self):
        """웹드라이버 종료"""
        if hasattr(self, 'driver'):
            self.driver.quit()
            
    @abstractmethod
    async def crawl_with_keyword(self, keyword: str) -> List[Dict]:
        """키워드 기반 크롤링 (추상 메서드)"""
        pass
@dataclass
class CrawlJob:
    """크롤링 작업 정의"""
    site_name: str
    keywords: List[str]
    max_jobs: int
    priority: int = 1
    ai_filters: Dict = None

class GeminiAICrawler(BaseCrawler):
    """Gemini AI가 통합된 크롤러"""
    
    def __init__(self, site_name, site_config):
        super().__init__(site_name, site_config)
        self.setup_gemini()
        self.keyword_cache = {}
        
    def setup_gemini(self):
        """Gemini AI 설정"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            self.logger.warning("GEMINI_API_KEY가 없습니다. AI 기능이 비활성화됩니다.")  # Changed to self.logger
            self.ai_model = None
            return
            
        try:
            genai.configure(api_key=api_key)
            self.ai_model = genai.GenerativeModel('gemini-2.0-flash-exp')
            self.logger.info("Gemini AI 초기화 완료")  # Changed to self.logger
        except Exception as e:
            self.logger.error(f"Gemini AI 초기화 실패: {e}")  # Changed to self.logger
            self.ai_model = None
    
    async def smart_crawl(self, base_keyword: str, job_category: str = "개발자"):
        """AI 기반 스마트 크롤링"""
        try:
            # 1. AI가 관련 키워드 생성
            enhanced_keywords = await self.generate_smart_keywords(
                base_keyword, job_category
            )
            
            # 2. 각 키워드로 크롤링
            all_jobs = []
            for keyword in enhanced_keywords:
                logger.info(f"키워드 '{keyword}'로 크롤링 중...")
                jobs = await self.crawl_with_keyword(keyword)
                all_jobs.extend(jobs)
                
                # 요청 간 대기 (중요!)
                await asyncio.sleep(random.uniform(3, 5))
            
            # 3. AI로 중복 제거 및 품질 필터링
            filtered_jobs = await self.ai_filter_jobs(all_jobs)
            
            logger.info(f"스마트 크롤링 완료: {len(filtered_jobs)}개 채용공고")
            return filtered_jobs
            
        except Exception as e:
            logger.error(f"AI 크롤링 실패: {e}")
            return []
    
    async def generate_smart_keywords(self, base_keyword: str, category: str) -> List[str]:
        """Gemini로 스마트 키워드 생성"""
        if base_keyword in self.keyword_cache:
            logger.info(f"캐시에서 '{base_keyword}'에 대한 키워드를 가져옵니다.")
            return self.keyword_cache[base_keyword]

        if not self.ai_model:
            return [base_keyword]

        max_retries = 5
        base_delay = 5  # seconds
        for i in range(max_retries):
            try:
                # Add delay between API calls
                await asyncio.sleep(10)  # Wait 10 seconds between calls
                
                prompt = f"""
Generate 3-5 related job search keywords for:
- Base keyword: {base_keyword}
- Category: {category}

Requirements:
1. Use actual Korean job posting terms
2. Include technical skills and job titles
3. Keep it specific and relevant

Format: Return only a JSON array
Example: ["Python", "백엔드 개발자", "Django"]
"""
            
                response = await asyncio.to_thread(
                    self.ai_model.generate_content,
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.1,
                        max_output_tokens=50
                    )
                )
                
                keywords_text = response.text.strip()
                if keywords_text.startswith('```'):
                    keywords_text = keywords_text.split('\n')[1:-1]
                    keywords_text = '\n'.join(keywords_text)
            
                keywords = json.loads(keywords_text)
                all_keywords = list(set([base_keyword] + keywords))
            
                logger.info(f"AI 키워드 생성: {all_keywords}")
                self.keyword_cache[base_keyword] = all_keywords[:3]
                return all_keywords[:3]  # Limit to 3 keywords to reduce API calls

            except json.JSONDecodeError as e:
                logger.warning(f"JSON 디코딩 실패: {e}, 응답: {keywords_text}")
                return [base_keyword]

            except google.api_core.exceptions.ResourceExhausted as e:
                if i == max_retries - 1:
                    logger.error(f"API call failed after {max_retries} retries: {e}")
                    return [base_keyword]
                
                delay = base_delay * (2 ** i) + random.uniform(0, 1)
                logger.warning(f"Rate limit exceeded. Retrying in {delay:.2f} seconds...")
                await asyncio.sleep(delay)

            except Exception as e:
                logger.warning(f"AI 키워드 생성 실패, 기본값 사용: {e}")
                return [base_keyword]
    
    async def ai_filter_jobs(self, jobs: List[Dict]) -> List[Dict]:
        """Gemini로 채용공고 품질 필터링"""
        if not self.ai_model or not jobs:
            return jobs
            
        try:
            # 배치 처리로 효율성 향상
            batch_size = 5
            filtered_jobs = []
            
            for i in range(0, len(jobs), batch_size):
                batch = jobs[i:i+batch_size]
                batch_results = await self.evaluate_job_batch(batch)
                
                for job, score in zip(batch, batch_results):
                    # 점수가 70점 이상인 것만 포함
                    if score >= 70:
                        job['ai_quality_score'] = score
                        filtered_jobs.append(job)
                
                # API 호출 제한 (배치당 3초 대기)
                await asyncio.sleep(3)
            
            logger.info(f"AI 품질 필터링: {len(jobs)} → {len(filtered_jobs)}개")
            return filtered_jobs
            
        except Exception as e:
            logger.warning(f"AI 필터링 실패, 원본 반환: {e}")
            return jobs
    
    async def evaluate_job_batch(self, jobs: List[Dict]) -> List[float]:
        """채용공고 배치 품질 평가"""
        max_retries = 5
        base_delay = 5  # seconds
        for i in range(max_retries):
            try:
                job_summaries = []
                for i, job in enumerate(jobs):
                    summary = f"""
{i+1}. 회사: {job.get('company_name', 'Unknown')}
   직무: {job.get('job_title', '미명시')}
   위치: {job.get('work_location', '미명시')}
   급여: {job.get('salary_range', '미명시')}
   키워드: {job.get('keywords', [])}
"""
                    job_summaries.append(summary)
                
                prompt = f"""
다음 채용공고들의 품질을 각각 0-100점으로 평가해주세요.

{chr(10).join(job_summaries)}

평가 기준:
- 정보의 구체성 (30점): 직무, 요구사항이 명확한가?
- 회사 신뢰성 (25점): 회사명이 명확하고 신뢰할 만한가?
- 급여 정보 (25점): 급여 정보가 투명한가?
- 기술스택 적합성 (20점): 관련 기술스택이 명시되어 있는가?

응답 형식: JSON 배열로 숫자만
예시: [85, 72, 90, 65, 78]
"""
                
                response = await asyncio.to_thread(
                    self.ai_model.generate_content, 
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.1,
                        max_output_tokens=100
                    )
                )
                
                scores_text = response.text.strip()
                if scores_text.startswith('```'):
                    scores_text = scores_text.split('\n')[1:-1]
                    scores_text = '\n'.join(scores_text)
                
                scores = json.loads(scores_text)
                
                # 점수 검증 및 정규화
                validated_scores = []
                for score in scores:
                    validated_score = min(max(float(score), 0), 100)
                    validated_scores.append(validated_score)
                
                return validated_scores

            except json.JSONDecodeError as e:
                logger.warning(f"JSON 디코딩 실패: {e}, 원시 응답: {response.text}")
                return [75.0] * len(jobs)

            except google.api_core.exceptions.ResourceExhausted as e:
                if i == max_retries - 1:
                    logger.error(f"API call failed after {max_retries} retries: {e}")
                    return [75.0] * len(jobs)
                
                delay = base_delay * (2 ** i) + random.uniform(0, 1)
                logger.warning(f"Rate limit exceeded. Retrying in {delay:.2f} seconds...")
                await asyncio.sleep(delay)
                
            except Exception as e:
                logger.warning(f"배치 평가 실패: {e}")
                return [75.0] * len(jobs)
    

    
    async def schedule_crawling(self, jobs: List[CrawlJob]):
        """크롤링 작업 스케줄링"""
        # 우선순위 정렬
        jobs.sort(key=lambda x: x.priority, reverse=True)
        
        for job in jobs:
            # Redis 큐에 작업 추가
            redis_connector.add_to_queue("crawl_jobs", json.dumps(job.__dict__))
        
        # 워커 실행 (동시성 제한)
        workers = [
            asyncio.create_task(self.crawl_worker()) 
            for _ in range(1)  # Gemini는 동시 요청 제한이 있으므로 1개만
        ]
        
        # Redis 큐는 join()이 필요 없으므로 제거
        
        return workers
    
    async def crawl_worker(self):
        """크롤링 워커"""
        while True:
            try:
                # Redis 큐에서 작업 가져오기
                job_str = await asyncio.to_thread(redis_connector.get_from_queue, "crawl_jobs")
                if job_str is None:
                    await asyncio.sleep(1) # 큐가 비어있으면 잠시 대기
                    continue
                
                job = CrawlJob(**json.loads(job_str))
                
                logger.info(f"🚀 크롤링 시작: {job.site_name} - {job.keywords}")
                
                all_job_results = []
                for keyword in job.keywords:
                    job_results = await self.smart_crawl(keyword, "개발자")
                    all_job_results.extend(job_results[:job.max_jobs])
                    
                    # 중요: 요청 간 대기
                    await asyncio.sleep(random.uniform(5, 8))
                
                # Save results to database
                if all_job_results:
                    logger.info(f"데이터베이스에 {len(all_job_results)}개의 채용공고를 저장합니다.")
                    for job_posting in all_job_results:
                        await mongodb_connector.insert_job_posting(job_posting)

                logger.info(f"✅ 크롤링 완료: {len(all_job_results)}개 수집")
                # 트렌드 분석 기능은 별도 모듈로 분리됨
                
                # Redis 큐는 task_done()이 필요 없음

            except asyncio.CancelledError:
                logger.info("워커가 종료됩니다.")
                break

            except Exception as e:
                logger.error(f"워커 에러: {e}")
                # Redis 큐는 task_done()이 필요 없음

    async def crawl_with_keyword(self, keyword: str) -> List[Dict]:
        """키워드 기반 크롤링 구현"""
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                base_url = self.site_config['base_url']
                search_path = self.site_config['search_path']
                url = f"{base_url}{search_path}?keyword={keyword}"
                
                # requests 모드로 먼저 시도
                results = await self._crawl_with_requests(url)
                if results:
                    return results
                    
                # selenium 모드로 재시도
                if self.driver:
                    results = await self._crawl_with_selenium(url)
                    if results:
                        return results
                        
                retry_count += 1
                if retry_count < max_retries:
                    await asyncio.sleep(random.uniform(2, 5))
                    
            except Exception as e:
                self.logger.error(f"크롤링 시도 {retry_count + 1} 실패: {e}")
                retry_count += 1
                if retry_count < max_retries:
                    await asyncio.sleep(random.uniform(2, 5))
                    
        self.logger.error(f"키워드 '{keyword}' 크롤링 최종 실패")
        return []

    def selenium_operations(self, url):
        self.logger.info(f"Selenium으로 URL에 접근 중: {url}")
        self.driver.get(url)
        time.sleep(2)
        self.logger.info(f"페이지 타이틀: {self.driver.title}")
        job_list_selector = self.site_config['selectors']['job_list']
        self.logger.info(f"'{job_list_selector}' 선택자를 기다리는 중...")
        wait = WebDriverWait(self.driver, 10)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, job_list_selector)))
        self.logger.info("선택자를 찾았습니다. 페이지 소스를 파싱합니다.")
        return self.driver.page_source

    async def _crawl_with_selenium(self, url: str) -> List[Dict]:
        """Selenium을 사용한 크롤링"""
        if redis_connector.is_url_visited("visited_urls", url):
            self.logger.info(f"이미 방문한 URL: {url}")
            return []

        if not self.driver:
            return []
            
        try:
            page_source = await asyncio.to_thread(self.selenium_operations, url)
            soup = BeautifulSoup(page_source, 'html.parser')
            redis_connector.add_visited_url("visited_urls", url) # Add to visited URLs
            return self._parse_job_items(soup)
            
        except Exception as e:
            self.logger.error(f"Selenium 크롤링 실패: {e}")
            
            # 드라이버 재초기화
            self.close_driver()
            self.setup_driver()
            return []

    async def _crawl_with_requests(self, url: str) -> List[Dict]:
        """Requests를 사용한 크롤링"""
        if redis_connector.is_url_visited("visited_urls", url):
            self.logger.info(f"이미 방문한 URL: {url}")
            return []

        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'DNT': '1'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        redis_connector.add_visited_url("visited_urls", url) # Add to visited URLs
                        return self._parse_job_items(soup)
                    else:
                        self.logger.warning(f"HTTP 요청 실패: {response.status}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Requests 크롤링 실패: {e}")
            return []
        
    def _parse_job_items(self, soup: BeautifulSoup) -> List[Dict]:
        """HTML에서 채용공고 파싱"""
        results = []
        job_items = soup.select(self.site_config['selectors']['job_list'])
        
        for item in job_items:
            try:
                job_data = {
                    'job_title': item.select_one(self.site_config['selectors']['title']).text.strip(),
                    'company_name': item.select_one(self.site_config['selectors']['company']).text.strip(),
                    'work_location': item.select_one(self.site_config['selectors']['location']).text.strip(),
                    'url': item.select_one(self.site_config['selectors']['url'])['href'],
                    'salary_range': item.select_one(self.site_config['selectors']['salary']).text.strip(),
                }
                results.append(job_data)
            except (AttributeError, KeyError) as e:
                self.logger.warning(f"항목 파싱 실패: {e}")
                continue
            
        return results

# 사용 예시
async def main():
    """메인 실행 함수"""
    crawler = None
    workers = []
    try:
        await mongodb_connector.connect()
        redis_connector.connect()

        all_workers = []
        target_sites = ["saramin", "jobkorea", "worknet", "comento", "securityfarm"]
        
        # JOB_CATEGORIES에서 모든 키워드를 동적으로 수집
        all_keywords_from_categories = []
        for category_keywords in JOB_CATEGORIES.values():
            all_keywords_from_categories.extend(category_keywords)
        common_keywords = list(set(all_keywords_from_categories)) # 중복 제거

        logger.info(f"--- 크롤링 시작 (대상 사이트: {', '.join(target_sites)}) ---")

        for site_name in target_sites:
            site_config = SITES_CONFIG.get(site_name)
            if not site_config:
                logger.warning(f"{site_name} 설정을 찾을 수 없습니다. 이 사이트는 건너뜁니다.")
                continue
            
            logger.info(f"--- {site_name} 사이트 크롤러 초기화 ---")
            crawler_instance = GeminiAICrawler(site_name, site_config)
            
            jobs_for_site = [
                CrawlJob(
                    site_name=site_name,
                    keywords=common_keywords,
                    max_jobs=15,
                    priority=site_config.get('priority', 1)
                )
            ]
            
            # 각 사이트별로 스케줄링하고 워커를 수집
            site_workers = await crawler_instance.schedule_crawling(jobs_for_site)
            all_workers.extend(site_workers)
        
        if not all_workers:
            logger.error("크롤링할 사이트가 설정되지 않았거나 워커가 생성되지 않았습니다. 스크립트를 종료합니다.")
            return

        # 모든 워커가 작업을 처리할 시간을 주기 위해 잠시 대기
        # 실제 환경에서는 큐가 비워질 때까지 기다리는 로직이 필요합니다.
        await asyncio.sleep(120) # 모든 사이트와 키워드를 고려하여 대기 시간 증가
        
        # finally 블록에서 사용할 수 있도록 변수 이름 통일
        workers = all_workers

    except Exception as e:
        logger.error(f"메인 실행 에러: {e}")
    finally:
        # 워커 종료
        for worker in workers:
            worker.cancel()
        if workers:
            await asyncio.gather(*workers, return_exceptions=True)

        if crawler and hasattr(crawler, 'driver'):
            crawler.close_driver()
        
        await mongodb_connector.close()
        redis_connector.close()

if __name__ == "__main__":
    asyncio.run(main())