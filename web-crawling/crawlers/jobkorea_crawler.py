from crawlers.base_crawler import BaseCrawler
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from config.sites_config import SITES_CONFIG
from utils.logger import setup_logger
import time

logger = setup_logger()

class JobkoreaCrawler(BaseCrawler):
    def __init__(self):
        super().__init__('jobkorea', SITES_CONFIG['jobkorea'])
    
    async def crawl(self, options=None):
        if options is None:
            options = {}
        
        keyword = options.get('keyword', '')
        max_jobs = options.get('max_jobs', 50)
        
        jobs = []
        
        try:
            self.setup_driver()
            
            # 검색 URL 구성
            search_params = {
                'stext': keyword,
                'tabType': 'recruit',
                'orderBy': 'reg'
            }
            
            # URL 생성
            params_str = '&'.join([f"{k}={v}" for k, v in search_params.items() if v])
            url = f"{self.base_url}{self.config['search_path']}?{params_str}"
            
            logger.info(f"잡코리아 크롤링 시작: {url}")
            
            self.driver.get(url)
            time.sleep(3)
            
            # 채용공고 리스트 대기
            job_list_element = self.wait_and_find_element(By.CSS_SELECTOR, self.selectors['job_list'])
            if not job_list_element:
                logger.warning("잡코리아: 채용공고 목록을 찾을 수 없습니다.")
                return jobs
            
            # 페이지 스크롤 (더 많은 공고 로드)
            self.scroll_to_load_more(3)
            
            # 모든 채용공고 요소 찾기
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, self.selectors['job_list'])
            logger.info(f"잡코리아: {len(job_elements)}개 채용공고 발견")
            
            for i, element in enumerate(job_elements[:max_jobs]):
                try:
                    raw_data = self.extract_job_data(element)
                    if raw_data and raw_data.get('title') and raw_data.get('company'):
                        normalized_data = self.normalize_data(raw_data)
                        jobs.append(normalized_data)
                        logger.debug(f"잡코리아: {i+1}번째 공고 추출 완료 - {raw_data.get('title')}")
                    
                except Exception as e:
                    logger.warning(f"잡코리아: {i+1}번째 공고 추출 실패 - {e}")
                    continue
            
            logger.info(f"잡코리아: 총 {len(jobs)}개 채용공고 수집 완료")
            
        except Exception as e:
            logger.error(f"잡코리아 크롤링 실패: {e}")
            raise
        
        finally:
            self.close_driver()
            self.delay()
        
        return jobs
    
    def extract_job_data(self, element):
        """개별 채용공고 데이터 추출"""
        try:
            # 제목과 URL
            title_elem = element.find_element(By.CSS_SELECTOR, '.post-list-corp-name a')
            title = title_elem.text.strip() if title_elem else ''
            url = title_elem.get_attribute('href') if title_elem else ''
            
            # 회사명
            try:
                company_elem = element.find_element(By.CSS_SELECTOR, '.post-list-info .corp-name a')
                company = company_elem.text.strip() if company_elem else ''
            except NoSuchElementException:
                company = ''
            
            # 조건 정보 (위치, 경험, 학력 등)
            try:
                condition_elements = element.find_elements(By.CSS_SELECTOR, '.post-list-info .post-list-option li')
                location = condition_elements[0].text.strip() if len(condition_elements) > 0 else ''
                experience = condition_elements[1].text.strip() if len(condition_elements) > 1 else ''
                salary = condition_elements[2].text.strip() if len(condition_elements) > 2 else ''
            except NoSuchElementException:
                location = experience = salary = ''
            
            # 마감일
            try:
                deadline_elem = element.find_element(By.CSS_SELECTOR, '.post-list-date')
                deadline = deadline_elem.text.strip() if deadline_elem else ''
            except NoSuchElementException:
                deadline = ''
            
            # 스킬 태그
            try:
                tag_elements = element.find_elements(By.CSS_SELECTOR, '.post-list-keyword .chip-keyword')
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
            logger.warning(f"잡코리아: 데이터 추출 실패 - {e}")
            return None