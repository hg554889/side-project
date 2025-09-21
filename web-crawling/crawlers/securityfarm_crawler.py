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
    
    async def crawl(self, options=None):
        """main.py에서 호출되는 메인 크롤링 메서드"""
        if options is None:
            options = {}

        try:
            # 기존 crawl_with_keyword 메서드 활용
            keyword = options.get('keyword', 'React')
            jobs = await self.crawl_with_keyword(keyword)

            logger.info(f"시큐리티팜 크롤링 완료: {len(jobs)}개")
            return jobs

        except Exception as e:
            logger.error(f"시큐리티팜 크롤링 실패: {e}")
            raise

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

            # 동적 로딩 대기 시간 증가
            wait_time = self.site_config.get('wait_time', 10)
            time.sleep(wait_time)

            # 스크롤링으로 동적 콘텐츠 로드
            if self.site_config.get('scroll_enabled', False):
                logger.info("페이지 스크롤링으로 동적 콘텐츠 로드")
                for i in range(3):
                    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(2)
                self.driver.execute_script("window.scrollTo(0, 0);")
                time.sleep(2)

            # Save page source for debugging
            with open("securityfarm_page_source.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            
            # 채용공고 리스트 대기
            job_list_element = await self.wait_and_find_element(By.CSS_SELECTOR, self.selectors['job_list'])
            if not job_list_element:
                logger.warning("시큐리티팜: 채용공고 목록을 찾을 수 없습니다.")
                return jobs
            
            # 모든 채용공고 요소 찾기 (정확한 선택자로 수정)
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, 'div.shadow-card-sm')
            logger.info(f"시큐리티팜: {len(job_elements)}개 채용공고 발견")
            
            for i, element in enumerate(job_elements[:max_jobs]):
                try:
                    raw_data = self.extract_job_data(element)
                    if raw_data:
                        if self.validate_job_data(raw_data) and raw_data.get('title'):
                            jobs.append(raw_data)
                            logger.info(f"✅ 시큐리티팜: {i+1}번째 공고 추출 완료 - {raw_data.get('title')}")
                        else:
                            logger.info(f"❌ 시큐리티팜: {i+1}번째 - 유효하지 않은 공고: {raw_data.get('title', 'N/A')}")
                    else:
                        element_text = element.text.strip()[:100]
                        logger.info(f"⚠️ 시큐리티팜: {i+1}번째 - 데이터 없음: {element_text}...")

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
        """개별 채용공고 데이터 추출 (Securityfarm 사이트 맞춤)"""
        try:
            data = {}

            # URL 정보는 직접적인 href가 없어 클릭 후 가져와야 하지만, 우선 비워둡니다.
            data['url'] = ''

            # 제목 추출
            try:
                data['title'] = element.find_element(By.CSS_SELECTOR, 'span.text-base.sm\:text-lg').text.strip()
            except NoSuchElementException:
                data['title'] = ''

            # 회사명 추출
            try:
                data['company'] = element.find_element(By.CSS_SELECTOR, 'span.text-sm.sm\:text-base.text-neutral-700').text.strip()
            except NoSuchElementException:
                data['company'] = ''

            # 위치 및 경력 정보 추출
            data['location'] = ''
            data['experience'] = ''
            try:
                details = element.find_elements(By.CSS_SELECTOR, 'div.flex.flex-row.items-center.gap-1.text-gray-600')
                if len(details) > 0:
                    data['location'] = details[0].text.strip()
                if len(details) > 1:
                    data['experience'] = details[1].text.strip()
            except NoSuchElementException:
                pass

            # 마감일 추출
            try:
                data['deadline'] = element.find_element(By.CSS_SELECTOR, 'span.text-red-500, span.text-emerald-700').text.strip()
            except NoSuchElementException:
                data['deadline'] = ''

            data['tags'] = []

            return data

        except Exception as e:
            logger.warning(f"시큐리티팜: 데이터 추출 실패 - {e}")
            return None