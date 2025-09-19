from crawlers.base_crawler import BaseCrawler
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from config.sites_config import SITES_CONFIG
from utils.logger import setup_logger
import time
import asyncio
import random

logger = setup_logger()

class ComentoCrawler(BaseCrawler):
    def __init__(self):
        super().__init__('comento', SITES_CONFIG['comento'])
        self.base_url = SITES_CONFIG['comento']['base_url']
        self.selectors = SITES_CONFIG['comento']['selectors']
    
    async def crawl_with_keyword(self, keyword: str) -> list:
        max_jobs = 50
        
        jobs = []
        
        try:
            # Temporarily change search_path for debugging
            if keyword:
                search_params = {
                    'query': f"{keyword} 코멘토",
                    'job_sort': 'job.latest_order'
                }
                params_str = '&'.join([f"{k}={v}" for k, v in search_params.items() if v])
                url = f"{self.base_url}/career/recruit?{params_str}" # Changed search_path
            else:
                url = f"{self.base_url}/career/recruit" # Changed search_path
            
            logger.info(f"코멘토(원티드) 크롤링 시작: {url}")
            
            self.driver.get(url)
            time.sleep(3)
            
            # Save page source for debugging
            with open("/tmp/comento_recruit_page_source.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)

            # 채용공고 리스트 대기
            job_list_element = await self.wait_and_find_element(By.CSS_SELECTOR, self.selectors['job_list'])
            if not job_list_element:
                logger.warning("코멘토: 채용공고 목록을 찾을 수 없습니다.")
                return jobs
            
            # 페이지 스크롤 (더 많은 공고 로드)
            await self.scroll_to_load_more(2)
            
            # 모든 채용공고 요소 찾기
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, self.selectors['job_list'])
            logger.info(f"코멘토: {len(job_elements)}개 채용공고 발견")
            
            for i, element in enumerate(job_elements[:max_jobs]):
                try:
                    raw_data = self.extract_job_data(element)
                    if raw_data and raw_data.get('title') and raw_data.get('company'):
                        normalized_data = self.normalize_data(raw_data)
                        jobs.append(normalized_data)
                        logger.debug(f"코멘토: {i+1}번째 공고 추출 완료 - {raw_data.get('title')}")
                    
                except Exception as e:
                    logger.warning(f"코멘토: {i+1}번째 공고 추출 실패 - {e}")
                    continue
            
            logger.info(f"코멘토: 총 {len(jobs)}개 채용공고 수집 완료")
            
        except Exception as e:
            logger.error(f"코멘토 크롤링 실패: {e}")
            raise
        
        return jobs
    


    async def scroll_to_load_more(self, scroll_count=3):
        """페이지 스크롤"""
        for _ in range(scroll_count):
            await asyncio.to_thread(
                self.driver.execute_script,
                "window.scrollTo(0, document.body.scrollHeight);"
            )
            await asyncio.sleep(1)
    
    def extract_job_data(self, element):
        """개별 채용공고 데이터 추출"""
        try:
            # URL 먼저 추출
            url_elem = element.find_element(By.CSS_SELECTOR, 'a')
            url = url_elem.get_attribute('href') if url_elem else ''
            
            # 제목
            try:
                title_elem = element.find_element(By.CSS_SELECTOR, 'h2, h3, .job-card-title, [data-cy="job-card"] h2')
                title = title_elem.text.strip() if title_elem else ''
            except NoSuchElementException:
                title = ''
            
            # 회사명
            try:
                company_elem = element.find_element(By.CSS_SELECTOR, '.company, .company-name, [data-cy="job-card"] .company')
                company = company_elem.text.strip() if company_elem else ''
            except NoSuchElementException:
                company = ''
            
            # 위치 정보
            try:
                location_elem = element.find_element(By.CSS_SELECTOR, '.location, .job-location, [data-cy="job-card"] .location')
                location = location_elem.text.strip() if location_elem else ''
            except NoSuchElementException:
                location = ''
            
            # 경력 정보
            try:
                experience_elem = element.find_element(By.CSS_SELECTOR, '.experience, .career, [data-cy="job-card"] .experience')
                experience = experience_elem.text.strip() if experience_elem else ''
            except NoSuchElementException:
                experience = ''
            
            # 급여 정보
            try:
                salary_elem = element.find_element(By.CSS_SELECTOR, '.salary, .reward, [data-cy="job-card"] .salary')
                salary = salary_elem.text.strip() if salary_elem else ''
            except NoSuchElementException:
                salary = ''
            
            # 마감일
            try:
                deadline_elem = element.find_element(By.CSS_SELECTOR, '.deadline, .due-time, [data-cy="job-card"] .deadline')
                deadline = deadline_elem.text.strip() if deadline_elem else ''
            except NoSuchElementException:
                deadline = ''
            
            # 기술 태그
            try:
                tag_elements = element.find_elements(By.CSS_SELECTOR, '.tag, .skill-tag, [data-cy="job-card"] .tag')
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
            logger.warning(f"코멘토: 데이터 추출 실패 - {e}")
            return None
