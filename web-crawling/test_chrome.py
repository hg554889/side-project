from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import sys

def test_chrome_driver():
    """크롬 드라이버 테스트"""
    try:
        # 크롬 옵션 설정
        options = Options()
        options.add_argument('--headless=new')  # 새로운 헤드리스 모드
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        # 드라이버 초기화
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        # 테스트 실행
        driver.get('https://www.google.com')
        print('✅ SUCCESS: ChromeDriver가 정상적으로 작동합니다!')
        
        # 시스템 정보 출력
        print(f'🔧 Chrome 버전: {driver.capabilities["browserVersion"]}')
        print(f'🔧 ChromeDriver 버전: {driver.capabilities["chrome"]["chromedriverVersion"].split(" ")[0]}')
        
        return True
        
    except Exception as e:
        print(f'❌ ERROR: {str(e)}')
        return False
        
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == '__main__':
    success = test_chrome_driver()
    sys.exit(0 if success else 1)
