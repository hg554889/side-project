from abc import ABC, abstractmethod
from typing import List, Dict
from dataclasses import dataclass
import asyncio
import json
import os
import random
from dotenv import load_dotenv
import google.generativeai as genai
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
from config.sites_config import SITES_CONFIG  # Add this import
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
        self.crawl_queue = asyncio.Queue()
        
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
        if not self.ai_model:
            return [base_keyword]
            
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
            return all_keywords[:3]  # Limit to 3 keywords to reduce API calls
        
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
            
        except Exception as e:
            logger.warning(f"배치 평가 실패: {e}")
            return [75.0] * len(jobs)  # 기본값 반환
    
    async def ai_analyze_trends(self, jobs: List[Dict]) -> Dict:
        """수집된 채용공고 트렌드 분석"""
        if not self.ai_model or not jobs:
            return {}
        
        try:
            # 데이터 요약 준비
            companies = [job.get('company_name', '') for job in jobs]
            titles = [job.get('job_title', '') for job in jobs]
            keywords = []
            for job in jobs:
                keywords.extend(job.get('keywords', []))
            
            prompt = f"""
다음 채용공고 데이터를 분석해서 트렌드를 요약해주세요.

수집된 공고 수: {len(jobs)}개
주요 회사들: {companies[:10]}
주요 직무들: {titles[:10]}
기술 키워드들: {keywords[:20]}

분석할 내용:
1. 인기 있는 기술스택 TOP 5
2. 주요 채용 회사 유형
3. 평균 급여 수준
4. 주요 근무 지역
5. 현재 시장 트렌드

응답 형식: JSON 객체
{{
  "top_skills": ["skill1", "skill2", ...],
  "company_types": ["대기업", "스타트업", ...],
  "salary_insights": "분석 내용",
  "locations": ["서울", "경기", ...],
  "market_trend": "전체적인 시장 트렌드 요약"
}}
"""
            
            response = await asyncio.to_thread(
                self.ai_model.generate_content,
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,
                    max_output_tokens=500
                )
            )
            
            analysis_text = response.text.strip()
            if analysis_text.startswith('```'):
                analysis_text = analysis_text.split('\n')[1:-1]
                analysis_text = '\n'.join(analysis_text)
            
            analysis = json.loads(analysis_text)
            logger.info("AI 트렌드 분석 완료")
            return analysis
            
        except Exception as e:
            logger.warning(f"트렌드 분석 실패: {e}")
            return {}
    
    async def schedule_crawling(self, jobs: List[CrawlJob]):
        """크롤링 작업 스케줄링"""
        # 우선순위 정렬
        jobs.sort(key=lambda x: x.priority, reverse=True)
        
        for job in jobs:
            await self.crawl_queue.put(job)
        
        # 워커 실행 (동시성 제한)
        workers = [
            asyncio.create_task(self.crawl_worker()) 
            for _ in range(1)  # Gemini는 동시 요청 제한이 있으므로 1개만
        ]
        
        await self.crawl_queue.join()
        
        # 워커 종료
        for worker in workers:
            worker.cancel()
    
    async def crawl_worker(self):
        """크롤링 워커"""
        while True:
            try:
                job = await self.crawl_queue.get()
                
                logger.info(f"🚀 크롤링 시작: {job.site_name} - {job.keywords}")
                
                results = []
                for keyword in job.keywords:
                    job_results = await self.smart_crawl(keyword, "개발자")
                    results.extend(job_results[:job.max_jobs])
                    
                    # 중요: 요청 간 대기
                    await asyncio.sleep(random.uniform(5, 8))
                
                # 트렌드 분석
                trends = await self.ai_analyze_trends(results)
                
                logger.info(f"✅ 크롤링 완료: {len(results)}개 수집")
                if trends:
                    logger.info(f"📊 트렌드: {trends.get('market_trend', 'N/A')}")
                
                self.crawl_queue.task_done()
                
            except Exception as e:
                logger.error(f"워커 에러: {e}")
                self.crawl_queue.task_done()

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

    async def _crawl_with_selenium(self, url: str) -> List[Dict]:
        """Selenium을 사용한 크롤링"""
        if not self.driver:
            return []
            
        try:
            await asyncio.to_thread(self.driver.get, url)
            await asyncio.sleep(2)  # 페이지 로딩 대기
            
            job_list_selector = self.site_config['selectors']['job_list']
            wait = WebDriverWait(self.driver, 10)
            await asyncio.to_thread(
                wait.until,
                EC.presence_of_element_located((By.CSS_SELECTOR, job_list_selector))
            )
            
            page_source = await asyncio.to_thread(lambda: self.driver.page_source)
            soup = BeautifulSoup(page_source, 'html.parser')
            return self._parse_job_items(soup)
            
        except Exception as e:
            self.logger.error(f"Selenium 크롤링 실패: {e}")
            # 드라이버 재초기화
            self.close_driver()
            self.setup_driver()
            return []

    async def _crawl_with_requests(self, url: str) -> List[Dict]:
        """Requests를 사용한 크롤링"""
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
    try:
        # site_config 가져오기
        site_config = SITES_CONFIG.get('saramin')
        if not site_config:
            raise ValueError("사람인 설정을 찾을 수 없습니다")

        # 크롤러 초기화
        crawler = GeminiAICrawler("saramin", site_config)
        
        # 크롤링 작업 정의
        jobs = [
            CrawlJob(
                site_name="saramin",
                keywords=["React"],
                max_jobs=20,
                priority=1,
                ai_filters={"min_quality": 75}
            ),
            CrawlJob(
                site_name="saramin",
                keywords=["Python"],
                max_jobs=15,
                priority=2
            )
        ]
        
        # 스케줄링 실행
        logger.info("🎯 AI 기반 스마트 크롤링 시작!")
        await crawler.schedule_crawling(jobs)
        
    except Exception as e:
        logger.error(f"메인 실행 에러: {e}")
    finally:
        if crawler and hasattr(crawler, 'driver'):
            crawler.close_driver()

if __name__ == "__main__":
    asyncio.run(main())