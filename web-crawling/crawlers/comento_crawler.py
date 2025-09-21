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
    
    async def crawl(self, options=None):
        """main.py에서 호출되는 메인 크롤링 메서드"""
        if options is None:
            options = {}

        try:
            # 셀레니움 드라이버 설정
            self.setup_driver()
            logger.info("코멘토 드라이버 설정 완료")

            # 기존 crawl_with_keyword 메서드 활용
            keyword = options.get('keyword', 'React')
            jobs = await self.crawl_with_keyword(keyword)

            logger.info(f"코멘토 크롤링 완료: {len(jobs)}개")
            return jobs

        except Exception as e:
            logger.error(f"코멘토 크롤링 실패: {e}")
            raise
        finally:
            # 드라이버 종료
            try:
                self.close_driver()
            except:
                pass

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

            # 동적 로딩 대기 시간
            wait_time = self.site_config.get('wait_time', 5)
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
            with open("comento_page_source.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)

            # 채용공고 리스트 대기
            job_list_element = await self.wait_and_find_element(By.CSS_SELECTOR, self.selectors['job_list'])
            if not job_list_element:
                logger.warning("코멘토: 채용공고 목록을 찾을 수 없습니다.")
                return jobs
            
            # 모든 채용공고 요소 찾기
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, self.selectors['job_list'])
            logger.info(f"코멘토: {len(job_elements)}개 채용공고 발견")
            
            for i, element in enumerate(job_elements[:max_jobs]):
                try:
                    raw_data = self.extract_job_data(element)
                    if raw_data:
                        if self.validate_job_data(raw_data) and self.is_valid_job_posting(raw_data):
                            jobs.append(raw_data)
                            logger.info(f"✅ 코멘토: {i+1}번째 공고 추출 완료 - {raw_data.get('title')}")
                        else:
                            logger.info(f"❌ 코멘토: {i+1}번째 - 유효하지 않은 공고: {raw_data.get('title', 'N/A')}")
                    else:
                        try:
                            element_text = element.text.strip()[:100]
                            logger.info(f"⚠️ 코멘토: {i+1}번째 - 데이터 없음: {element_text}...")
                        except:
                            logger.info(f"⚠️ 코멘토: {i+1}번째 - 요소 접근 실패")

                except Exception as e:
                    logger.warning(f"코멘토: {i+1}번째 공고 추출 실패 - {e}")
                    continue
            
            logger.info(f"코멘토: 총 {len(jobs)}개 채용공고 수집 완료")
            
        except Exception as e:
            logger.error(f"코멘토 크롤링 실패: {e}")
            raise

        finally:
            self.close_driver()
            await self.delay()

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
            # 요소의 텍스트 내용 확인
            element_text = element.text.strip()
            if not element_text or len(element_text) < 10:
                return None

            data = {}

            # 제목 추출 - 여러 방법 시도
            title = ''
            title_selectors = [
                self.selectors['title'],
                'h1', 'h2', 'h3', 'h4', 'h5',
                '.job-title', '.position-title', '.title',
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
                url_elem = element.find_element(By.CSS_SELECTOR, self.selectors['url'])
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
                '.company', '.company-name', '.corp-name', '.employer'
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

            # 위치 정보
            location = ''
            location_selectors = [
                self.selectors['location'],
                '.location', '.area', '.region', '.address'
            ]
            for selector in location_selectors:
                try:
                    location_elem = element.find_element(By.CSS_SELECTOR, selector)
                    location = location_elem.text.strip()
                    if location:
                        break
                except:
                    continue
            data['location'] = location

            # 경력 정보
            experience = ''
            exp_selectors = [
                self.selectors['experience'],
                '.experience', '.career', '.exp', '.level'
            ]
            for selector in exp_selectors:
                try:
                    exp_elem = element.find_element(By.CSS_SELECTOR, selector)
                    experience = exp_elem.text.strip()
                    if experience:
                        break
                except:
                    continue
            data['experience'] = experience

            # 급여 정보
            salary = ''
            salary_selectors = ['.salary', '.pay', '.wage', '.reward']
            for selector in salary_selectors:
                try:
                    salary_elem = element.find_element(By.CSS_SELECTOR, selector)
                    salary = salary_elem.text.strip()
                    if salary:
                        break
                except:
                    continue
            data['salary'] = salary

            # 마감일
            deadline = ''
            deadline_selectors = [
                self.selectors['deadline'],
                '.deadline', '.date', '.due-date', '.expires'
            ]
            for selector in deadline_selectors:
                try:
                    deadline_elem = element.find_element(By.CSS_SELECTOR, selector)
                    deadline = deadline_elem.text.strip()
                    if deadline:
                        break
                except:
                    continue
            data['deadline'] = deadline

            # 기술 태그
            try:
                tags = []
                tag_selectors = [
                    self.selectors['skills'],
                    '.skill', '.tag', '.keyword', '.tech', '.badge'
                ]
                for selector in tag_selectors:
                    try:
                        tag_elements = element.find_elements(By.CSS_SELECTOR, selector)
                        if tag_elements:
                            tags = [tag.text.strip() for tag in tag_elements if tag.text.strip()]
                            break
                    except:
                        continue
                data['tags'] = tags
            except:
                data['tags'] = []

            return data

        except Exception as e:
            logger.warning(f"코멘토: 데이터 추출 실패 - {e}")
            return None

    def is_valid_job_posting(self, data):
        """채용공고 유효성 검증"""
        try:
            title = data.get('title', '').strip()
            company = data.get('company', '').strip()

            # 1. 제목 필수 (최소 길이 완화)
            if not title or len(title) < 2:
                return False

            # 2. 회사명 있으면 더 좋음 (필수는 아님)
            has_company = company and len(company) > 1

            # 3. 채용 관련 키워드 체크
            job_keywords = [
                '채용', '모집', '구인', '개발자', '엔지니어', '매니저', '팀장', '인턴', '신입', '경력',
                'developer', 'engineer', 'manager', 'intern', 'junior', 'senior', 'analyst',
                '백엔드', '프론트엔드', '풀스택', '데브옵스', '마케팅', '기획', '디자인', '영업',
                'backend', 'frontend', 'fullstack', 'devops', 'marketing', 'design', 'sales'
            ]

            title_lower = title.lower()
            has_job_keyword = any(keyword.lower() in title_lower for keyword in job_keywords)

            # 4. 제외할 키워드 체크 (최소한만)
            exclude_keywords = [
                '로그인', '회원가입', 'login', 'signup', '직무별 공고', '커뮤니티', '광고문의', '무제한 휴가'
            ]

            has_exclude_keyword = any(keyword.lower() in title_lower for keyword in exclude_keywords)

            # 5. 최종 판정
            if has_exclude_keyword:
                return False

            # 제외 키워드가 없으면 모두 유효로 판정 (최대한 포용적으로)
            return True

        except Exception as e:
            logger.warning(f"유효성 검증 실패: {e}")
            return False
