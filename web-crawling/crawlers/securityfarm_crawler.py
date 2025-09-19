from crawlers.base_crawler import BaseCrawler
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from config.sites_config import SITES_CONFIG
from utils.logger import setup_logger
import time

logger = setup_logger()

class SecurityfarmCrawler(BaseCrawler):
    def __init__(self):
        super().__init__('securityfarm', SITES_CONFIG['securityfarm'])
        self.base_url = SITES_CONFIG['securityfarm']['base_url']
        self.selectors = SITES_CONFIG['securityfarm']['selectors']
    
    async def crawl_with_keyword(self, keyword: str) -> list:
        max_jobs = 50
        
        jobs = []
        
        try:
            
            # 시큐리티팜 검색 URL 구성
            if keyword:
                search_params = {
                    'search': keyword,
                    'category': 'all'
                }
                params_str = '&'.join([f"{k}={v}" for k, v in search_params.items() if v])
                url = f"{self.base_url}{self.site_config['search_path']}?{params_str}"
            else:
                url = f"{self.base_url}{self.site_config['search_path']}"
            
            logger.info(f"시큐리티팜 크롤링 시작: {url}")
            
            self.driver.get(url)
            time.sleep(4)  # 시큐리티팜은 로딩이 좀 걸릴 수 있음
            
            # 채용공고 리스트 대기
            job_list_element = await self.wait_and_find_element(By.CSS_SELECTOR, self.selectors['job_list'])
            if not job_list_element:
                logger.warning("시큐리티팜: 채용공고 목록을 찾을 수 없습니다.")
                return jobs
            
            # 모든 채용공고 요소 찾기
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, self.selectors['job_list'])
            logger.info(f"시큐리티팜: {len(job_elements)}개 채용공고 발견")
            
            for i, element in enumerate(job_elements[:max_jobs]):
                try:
                    raw_data = self.extract_job_data(element)
                    if raw_data and raw_data.get('title') and raw_data.get('company'):
                        normalized_data = self.normalize_data(raw_data)
                        jobs.append(normalized_data)
                        logger.debug(f"시큐리티팜: {i+1}번째 공고 추출 완료 - {raw_data.get('title')}")
                    
                except Exception as e:
                    logger.warning(f"시큐리티팜: {i+1}번째 공고 추출 실패 - {e}")
                    continue
            
            logger.info(f"시큐리티팜: 총 {len(jobs)}개 채용공고 수집 완료")
            
        except Exception as e:
            logger.error(f"시큐리티팜 크롤링 실패: {e}")
            raise
        
        finally:
            self.close_driver()
            await self.delay()
        
        return jobs
    
    def extract_job_data(self, element):
        """개별 채용공고 데이터 추출"""
        try:
            # URL 먼저 추출
            url_elem = element.find_element(By.CSS_SELECTOR, 'a')
            url = url_elem.get_attribute('href') if url_elem else ''
            
            # 제목 - 여러 선택자 시도
            title = ''
            title_selectors = ['.job-title', '.card-title', 'h3', 'h4', '.title', '.subject']
            for selector in title_selectors:
                try:
                    title_elem = element.find_element(By.CSS_SELECTOR, selector)
                    title = title_elem.text.strip()
                    if title:
                        break
                except NoSuchElementException:
                    continue
            
            # 회사명 - 여러 선택자 시도
            company = ''
            company_selectors = ['.company-name', '.corp-name', '.company', '.corp', '.employer']
            for selector in company_selectors:
                try:
                    company_elem = element.find_element(By.CSS_SELECTOR, selector)
                    company = company_elem.text.strip()
                    if company:
                        break
                except NoSuchElementException:
                    continue
            
            # 위치 정보
            location = ''
            location_selectors = ['.location', '.area', '.job-location', '.place', '.region']
            for selector in location_selectors:
                try:
                    location_elem = element.find_element(By.CSS_SELECTOR, selector)
                    location = location_elem.text.strip()
                    if location:
                        break
                except NoSuchElementException:
                    continue
            
            # 경력 정보
            experience = ''
            exp_selectors = ['.experience', '.career', '.job-experience', '.exp', '.경력']
            for selector in exp_selectors:
                try:
                    exp_elem = element.find_element(By.CSS_SELECTOR, selector)
                    experience = exp_elem.text.strip()
                    if experience:
                        break
                except NoSuchElementException:
                    continue
            
            # 급여 정보
            salary = ''
            salary_selectors = ['.salary', '.pay', '.job-salary', '.wage', '.연봉']
            for selector in salary_selectors:
                try:
                    salary_elem = element.find_element(By.CSS_SELECTOR, selector)
                    salary = salary_elem.text.strip()
                    if salary:
                        break
                except NoSuchElementException:
                    continue
            
            # 마감일
            deadline = ''
            deadline_selectors = ['.deadline', '.date', '.job-date', '.due-date', '.마감일']
            for selector in deadline_selectors:
                try:
                    deadline_elem = element.find_element(By.CSS_SELECTOR, selector)
                    deadline = deadline_elem.text.strip()
                    if deadline:
                        break
                except NoSuchElementException:
                    continue
            
            # 기술 태그
            tags = []
            tag_selectors = ['.skill', '.tag', '.keyword', '.tech', '.기술']
            for selector in tag_selectors:
                try:
                    tag_elements = element.find_elements(By.CSS_SELECTOR, selector)
                    if tag_elements:
                        tags = [tag.text.strip() for tag in tag_elements if tag.text.strip()]
                        break
                except NoSuchElementException:
                    continue
            
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
            logger.warning(f"시큐리티팜: 데이터 추출 실패 - {e}")
            return None