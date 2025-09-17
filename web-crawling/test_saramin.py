from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

def test_saramin():
    options = Options()
    # 헤드리스 모드 끄기 - 브라우저가 실제로 열림
    # options.add_argument('--headless')
    
    driver = webdriver.Chrome(options=options)
    
    try:
        # 실제 사람인 React 검색 페이지
        url = "https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword=React"
        print(f"접속 URL: {url}")
        
        driver.get(url)
        time.sleep(5)
        
        print(f"현재 URL: {driver.current_url}")
        print(f"페이지 제목: {driver.title}")
        
        # 가능한 채용공고 선택자들 시도
        selectors = [
            '.item_recruit',
            '.content_list',
            '.list_body',
            '.recruit_info',
            '.job_tit',
            '[class*="recruit"]',
            '[class*="job"]',
            '.list_item',
            '.item_job',
            '.box_item'
        ]
        
        for selector in selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                print(f"선택자 '{selector}': {len(elements)}개 요소 발견")
                if elements:
                    print(f"  첫 번째 요소 텍스트: {elements[0].text[:100]}")
            except Exception as e:
                print(f"선택자 '{selector}' 오류: {e}")
        
        # 페이지 소스에서 클래스명 패턴 찾기
        page_source = driver.page_source
        print(f"\n페이지 소스 길이: {len(page_source)}")
        
        # 일반적인 채용공고 관련 키워드가 포함된 클래스명 찾기
        import re
        class_patterns = re.findall(r'class="([^"]*(?:recruit|job|item|list)[^"]*)"', page_source)
        unique_classes = list(set(class_patterns))[:10]  # 상위 10개만
        
        print("\n발견된 관련 클래스명:")
        for cls in unique_classes:
            print(f"  .{cls}")
        
        print("\n브라우저를 확인한 후 아무 키나 누르고 엔터를 누르세요...")
        input()
        
    except Exception as e:
        print(f"오류 발생: {e}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_saramin()