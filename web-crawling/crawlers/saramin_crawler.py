from crawlers.base_crawler import BaseCrawler
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from config.sites_config import SITES_CONFIG
from utils.logger import setup_logger
import asyncio
import time
import random

logger = setup_logger("saramin_crawler")

class SaraminCrawler(BaseCrawler):
    def __init__(self):
        super().__init__('saramin', SITES_CONFIG['saramin'])
        self.base_url = SITES_CONFIG['saramin']['base_url']
        self.selectors = SITES_CONFIG['saramin']['selectors']
    
    async def crawl_with_keyword(self, keyword: str) -> list:
        max_jobs = 50
        
        jobs = []
        
        try:
            # 검색 URL 구성
            if keyword:
                search_params = {
                    'recruitFilterType': 'domestic',
                    'searchType': 'search',
                    'searchword': keyword,
                }
                params_str = '&'.join([f"{k}={v}" for k, v in search_params.items() if v])
                url = f"{self.base_url}{SITES_CONFIG['saramin']['search_path']}?{params_str}"
            else:
                url = f"{self.base_url}{SITES_CONFIG['saramin']['search_path']}"
            
            logger.info(f"사람인 크롤링 시작: {url}")
            
            # 비동기로 페이지 로드
            await asyncio.to_thread(self.driver.get, url)
            
            # 채용공고 리스트 대기
            job_list_element = await self.wait_for_element(By.CSS_SELECTOR, self.selectors['job_list'])
            if not job_list_element:
                logger.warning("채용공고 목록을 찾을 수 없습니다.")
                return jobs
            
            # 페이지 스크롤
            await self.scroll_page(3)
            
            # 채용공고 추출
            job_elements = await asyncio.to_thread(
                self.driver.find_elements, 
                By.CSS_SELECTOR, 
                self.selectors['job_list']
            )
            
            logger.info(f"사람인: {len(job_elements)}개 채용공고 발견")
            
            for i, element in enumerate(job_elements[:max_jobs]):
                try:
                    raw_data = await self.extract_job_data(element)
                    if raw_data:
                        if raw_data.get('title'):
                            jobs.append(raw_data)
                            logger.info(f"✅ 사람인: {i+1}번째 공고 추출 완료 - {raw_data.get('title')}")
                        else:
                            logger.info(f"❌ 사람인: {i+1}번째 - 제목 없음: {raw_data}")
                    else:
                        try:
                            element_text = element.text.strip()[:100]
                            logger.info(f"⚠️ 사람인: {i+1}번째 - 데이터 없음: {element_text}...")
                        except:
                            logger.info(f"⚠️ 사람인: {i+1}번째 - 요소 접근 실패")

                except Exception as e:
                    logger.warning(f"사람인: {i+1}번째 공고 추출 실패 - {e}")
                    continue
            
            logger.info(f"사람인: 총 {len(jobs)}개 채용공고 수집 완료")
            
        except Exception as e:
            logger.error(f"사람인 크롤링 실패: {e}")
            raise
        
        return jobs
    
    async def wait_for_element(self, by, selector, timeout=10):
        """요소 대기"""
        try:
            element = await asyncio.to_thread(
                WebDriverWait(self.driver, timeout).until,
                EC.presence_of_element_located((by, selector))
            )
            return element
        except TimeoutException:
            logger.warning(f"요소를 찾을 수 없음: {selector}")
            with open("saramin_page_source.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            return None
    
    async def scroll_page(self, scroll_count=3):
        """페이지 스크롤"""
        for _ in range(scroll_count):
            await asyncio.to_thread(
                self.driver.execute_script,
                "window.scrollTo(0, document.body.scrollHeight);"
            )
            await asyncio.sleep(1)
    
    async def extract_job_data(self, element):
        """채용공고 데이터 추출"""
        try:
            # 요소의 텍스트 내용 확인
            element_text = element.text.strip()
            if not element_text or len(element_text) < 10:
                return None

            data = {}

            # 제목 추출 - 여러 방법 시도
            title = ''
            title_selectors = [
                self.selectors['title'],
                '.job_tit a', '.job_title a', '.item_title a',
                'h1', 'h2', 'h3', 'h4', 'h5',
                '.title', '.position-title',
                '[class*="title"]', '[class*="position"]',
                'strong', 'b', '.font-bold', '.font-medium'
            ]

            for selector in title_selectors:
                try:
                    title_elem = element.find_element(By.CSS_SELECTOR, selector)
                    title = title_elem.text.strip()
                    if title and len(title) > 3:
                        break
                except:
                    continue

            # 제목을 찾지 못했으면 텍스트에서 첫 번째 줄 사용
            if not title and element_text:
                lines = element_text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and len(line) > 3 and not any(skip in line for skip in ['로그인', '회원가입', '검색', '메뉴']):
                        title = line
                        break

            data['title'] = title

            # URL 추출
            try:
                url_elem = element.find_element(By.CSS_SELECTOR, self.selectors['title'])
                data['url'] = url_elem.get_attribute('href') or ''
            except:
                try:
                    url_elem = element.find_element(By.CSS_SELECTOR, 'a')
                    data['url'] = url_elem.get_attribute('href') or ''
                except:
                    data['url'] = ''

            # 회사명 추출
            company = ''
            company_selectors = [
                self.selectors['company'],
                '.corp_name a', '.company_name', '.company',
                '.corp', '.employer'
            ]

            for selector in company_selectors:
                try:
                    company_elem = element.find_element(By.CSS_SELECTOR, selector)
                    company = company_elem.text.strip()
                    if company:
                        break
                except:
                    continue

            data['company'] = company

            # 조건 정보 추출
            try:
                conditions = element.find_elements(By.CSS_SELECTOR, '.job_condition span')
                data['location'] = conditions[0].text.strip() if len(conditions) > 0 else ''
                data['experience'] = conditions[1].text.strip() if len(conditions) > 1 else ''
                data['salary'] = conditions[2].text.strip() if len(conditions) > 2 else ''
            except:
                data['location'] = ''
                data['experience'] = ''
                data['salary'] = ''

            # 마감일 추출
            try:
                deadline_elem = element.find_element(By.CSS_SELECTOR, self.selectors.get('deadline', '.job_date .date'))
                data['deadline'] = deadline_elem.text.strip()
            except:
                data['deadline'] = ''

            # 태그 추출
            try:
                tags = element.find_elements(By.CSS_SELECTOR, self.selectors.get('tags', '.tag'))
                data['tags'] = [tag.text.strip() for tag in tags if tag.text.strip()]
            except:
                data['tags'] = []

            return data

        except Exception as e:
            logger.warning(f"데이터 추출 실패: {e}")
            return None
    
    # 현재 클래스에 다음 메서드를 추가하세요:

    async def crawl(self, options=None):
        """main.py에서 호출되는 메인 크롤링 메서드"""
        if options is None:
            options = {}
        
        try:
            # 셀레니움 드라이버 설정
            self.setup_driver()
            logger.info("사람인 드라이버 설정 완료")
            
            # 기존 crawl_with_keyword 메서드 활용
            keyword = options.get('keyword', 'React')
            jobs = await self.crawl_with_keyword(keyword)
            
            logger.info(f"사람인 크롤링 완료: {len(jobs)}개")
            return jobs
            
        except Exception as e:
            logger.error(f"사람인 크롤링 실패: {e}")
            raise
        finally:
            # 드라이버 종료
            try:
                self.close_driver()
            except:
                pass