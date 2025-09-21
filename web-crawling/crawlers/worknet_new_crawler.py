from crawlers.base_crawler import BaseCrawler
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from config.sites_config import SITES_CONFIG
from utils.logger import setup_logger
import time

logger = setup_logger()

class WorknetNewCrawler(BaseCrawler):
    def __init__(self):
        super().__init__('worknet_new', SITES_CONFIG['worknet_new'])
        self.base_url = SITES_CONFIG['worknet_new']['base_url']
        self.selectors = SITES_CONFIG['worknet_new']['selectors']
        self.search_params = SITES_CONFIG['worknet_new']['search_params'].copy()

    async def crawl(self, options=None):
        """main.py에서 호출되는 메인 크롤링 메서드"""
        if options is None:
            options = {}

        try:
            keyword = options.get('keyword', 'React')
            jobs = await self.crawl_with_keyword(keyword)

            logger.info(f"새 워크넷 크롤링 완료: {len(jobs)}개")
            return jobs

        except Exception as e:
            logger.error(f"새 워크넷 크롤링 실패: {e}")
            raise

    async def crawl_with_keyword(self, keyword: str) -> list:
        max_jobs = 50
        jobs = []

        try:
            # 1단계: 검색 폼 페이지로 이동
            form_url = f"{self.base_url}{self.site_config['form_path']}"
            logger.info(f"검색 폼 페이지로 이동: {form_url}")

            self.driver.get(form_url)
            time.sleep(3)

            # 2단계: 검색어 입력
            if keyword:
                try:
                    search_input = WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.ID, "jobSearchKeyword"))
                    )
                    search_input.clear()
                    search_input.send_keys(keyword)
                    logger.info(f"검색어 입력: {keyword}")
                    time.sleep(1)
                except TimeoutException:
                    logger.warning("검색어 입력 필드를 찾을 수 없습니다.")

            # 3단계: 검색 실행 - 다중 셀렉터 시도
            search_success = False
            selectors_to_try = [
                "button[onclick*='fn_Search']",
                "input[type='submit']",
                "button[type='submit']",
                "input[value*='검색']",
                "button:contains('검색')",
                ".btn_search",
                "#searchBtn",
                ".search-btn"
            ]

            for i, selector in enumerate(selectors_to_try):
                try:
                    logger.info(f"검색 버튼 시도 {i+1}: {selector}")

                    if "contains" in selector:
                        # XPath로 텍스트 포함 검색
                        search_button = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), '검색')]"))
                        )
                    else:
                        search_button = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )

                    # 스크롤해서 버튼이 보이도록 함
                    self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", search_button)
                    time.sleep(2)

                    # JavaScript로 클릭
                    self.driver.execute_script("arguments[0].click();", search_button)
                    logger.info(f"검색 버튼 클릭 성공: {selector}")
                    search_success = True
                    break

                except (NoSuchElementException, TimeoutException) as e:
                    logger.warning(f"검색 버튼 {selector} 찾기 실패: {e}")
                    continue

            if not search_success:
                # 최후 수단: JavaScript 함수들 시도
                js_functions = ["fn_Search(1)", "searchJobs()", "doSearch()", "submitForm()"]
                for js_func in js_functions:
                    try:
                        logger.info(f"JavaScript 함수 시도: {js_func}")
                        self.driver.execute_script(js_func)
                        search_success = True
                        break
                    except Exception as js_error:
                        logger.warning(f"JavaScript 함수 {js_func} 실패: {js_error}")
                        continue

            if not search_success:
                # 마지막 시도: Enter 키 입력
                try:
                    search_input = self.driver.find_element(By.ID, "jobSearchKeyword")
                    search_input.send_keys("\n")
                    logger.info("Enter 키로 검색 실행")
                    search_success = True
                except Exception as enter_error:
                    logger.error(f"Enter 키 검색 실패: {enter_error}")
                    raise Exception("모든 검색 방법 실패")

            # 검색 결과 로딩 대기
            time.sleep(8)

            # 4단계: 검색 결과 추출
            try:
                # 채용공고 리스트 대기
                job_list_elements = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, self.selectors['job_list']))
                )
                logger.info(f"새 워크넷: {len(job_list_elements)}개 채용공고 발견")

                for i, element in enumerate(job_list_elements[:max_jobs]):
                    try:
                        raw_data = self.extract_job_data_new(element)
                        if raw_data and raw_data.get('title') and raw_data.get('company'):
                            jobs.append(raw_data)
                            logger.debug(f"새 워크넷: {i+1}번째 공고 추출 완료 - {raw_data.get('title')}")

                    except Exception as e:
                        logger.warning(f"새 워크넷: {i+1}번째 공고 추출 실패 - {e}")
                        continue

            except TimeoutException:
                logger.warning("검색 결과를 찾을 수 없습니다.")

            logger.info(f"새 워크넷: 총 {len(jobs)}개 채용공고 수집 완료")

        except Exception as e:
            logger.error(f"새 워크넷 크롤링 실패: {e}")
            raise

        finally:
            self.close_driver()
            await self.delay()

        return jobs

    def extract_job_data_new(self, element):
        """새 워크넷 페이지용 데이터 추출"""
        try:
            # 제목과 URL
            try:
                title_elem = element.find_element(By.CSS_SELECTOR, self.selectors['title'])
                title = title_elem.text.strip() if title_elem else ''
                url = title_elem.get_attribute('href') if title_elem else ''
            except NoSuchElementException:
                title = ''
                url = ''

            # 회사명
            try:
                company_elem = element.find_element(By.CSS_SELECTOR, self.selectors['company'])
                company = company_elem.text.strip() if company_elem else ''
            except NoSuchElementException:
                company = ''

            # 위치 정보
            try:
                location_elem = element.find_element(By.CSS_SELECTOR, self.selectors['location'])
                location = location_elem.text.strip() if location_elem else ''
            except NoSuchElementException:
                location = ''

            # 경력 정보
            try:
                experience_elem = element.find_element(By.CSS_SELECTOR, self.selectors['experience'])
                experience = experience_elem.text.strip() if experience_elem else ''
            except NoSuchElementException:
                experience = ''

            # 급여 정보
            try:
                salary_elem = element.find_element(By.CSS_SELECTOR, self.selectors['salary'])
                salary = salary_elem.text.strip() if salary_elem else ''
            except NoSuchElementException:
                salary = ''

            # 마감일
            try:
                deadline_elem = element.find_element(By.CSS_SELECTOR, self.selectors['deadline'])
                deadline = deadline_elem.text.strip() if deadline_elem else ''
            except NoSuchElementException:
                deadline = ''

            return {
                'title': title,
                'company': company,
                'location': location,
                'experience': experience,
                'salary': salary,
                'deadline': deadline,
                'url': url,
                'tags': []
            }

        except Exception as e:
            logger.warning(f"새 워크넷: 데이터 추출 실패 - {e}")
            return None