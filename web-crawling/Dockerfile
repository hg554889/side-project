FROM python:3.11-slim

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Chrome 설치 (최신 방식)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# ChromeDriver 설치
RUN CHROME_DRIVER_VERSION=`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE` \
    && wget -O /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/$CHROME_DRIVER_VERSION/chromedriver_linux64.zip \
    && unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/ \
    && rm /tmp/chromedriver.zip \
    && chmod +x /usr/local/bin/chromedriver

# 작업 디렉토리 설정
WORKDIR /app

# pip 업그레이드 및 기본 패키지 설치
RUN pip install --upgrade pip setuptools wheel

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 로그 및 출력 디렉토리 생성
RUN mkdir -p /app/logs /app/output

# 애플리케이션 코드 복사
COPY . .

# 크롤링 사용자 생성 (보안)
RUN useradd -m -s /bin/bash crawler
RUN chown -R crawler:crawler /app
USER crawler

# 환경 변수 설정
ENV PYTHONPATH=/app
ENV DISPLAY=:99

# 기본 실행 명령
CMD ["python", "main.py"]