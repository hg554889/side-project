# SkillMap 크롤링 시스템 - Docker 실행 가이드

## 🚀 빠른 시작

```bash
# 1. Docker Compose로 전체 시스템 실행
docker-compose up --build

# 2. 결과 확인
# - 크롤링 로그: 터미널에서 실시간 확인
# - 결과 파일: ./output/crawl_results.json
# - MongoDB UI: http://localhost:8081 (admin/skillmap123)
```

## 📋 포함된 크롤러

✅ **개선된 4개 크롤러 모두 포함**:
- **Saramin**: 29개 → 20개 (키워드 필터링 제거)
- **WorkNet New**: 새로운 상세 검색 페이지 (10개)
- **Comento**: 355개 → 17개 (강화된 유효성 검증)
- **SecurityFarm**: 24개 → 35개 (키워드 필터링 제거)

## 🔧 서비스 구성

### 1. MongoDB (포트: 27017)
- 사용자: `admin` / 비밀번호: `skillmap123`
- 데이터베이스: `skillmap`
- 컬렉션: `job_postings`

### 2. Web Crawler
- 모든 개선된 크롤러 실행
- 결과를 MongoDB에 저장
- JSON 파일로도 출력

### 3. Mongo Express (포트: 8081)
- MongoDB 관리 웹 UI
- 접속: http://localhost:8081
- 로그인: `admin` / `skillmap123`

## 📂 디렉토리 구조

```
web-crawling/
├── docker-compose.yml     # Docker Compose 설정
├── Dockerfile            # 크롤러 이미지 빌드
├── requirements.txt      # Python 의존성
├── init-mongo.js        # MongoDB 초기화
├── .env.example         # 환경변수 예시
├── logs/                # 크롤링 로그 (Docker 볼륨)
├── output/              # 결과 파일 (Docker 볼륨)
├── main.py              # 메인 실행 파일
└── crawlers/            # 개선된 크롤러들
    ├── saramin_crawler.py
    ├── worknet_new_crawler.py
    ├── comento_crawler.py
    └── securityfarm_crawler.py
```

## 🎯 실행 옵션

### 기본 실행 (모든 사이트)
```bash
docker-compose up --build
```

### 특정 사이트만 실행
```bash
# docker-compose.yml 에서 command 수정:
# --sites saramin,comento
docker-compose up --build
```

### 키워드 변경
```bash
# docker-compose.yml 에서 command 수정:
# --keyword Python
docker-compose up --build
```

## 📊 결과 확인

### 1. 실시간 로그 확인
```bash
# 크롤링 진행상황 실시간 확인
docker-compose logs -f web-crawler
```

### 2. 결과 파일 확인
```bash
# JSON 결과 파일 확인
cat output/crawl_results.json
```

### 3. MongoDB 데이터 확인
- 웹 UI: http://localhost:8081
- 또는 MongoDB Compass로 mongodb://admin:skillmap123@localhost:27017/skillmap 접속

## 🔍 예상 결과

### 크롤링 통계
```
크롤링 결과:
  총 크롤링: 82개    (saramin: 20 + worknet_new: 10 + comento: 17 + securityfarm: 35)
  처리완료: 75개     (데이터 정규화 완료)
  저장완료: 75개     (MongoDB 저장)
  오류발생: 0개
```

### 실제 채용공고 예시
- 백엔드/프론트엔드 개발자
- DevOps 엔지니어
- ML/AI 데이터분석가
- 프로젝트 매니저
- Windows Client 개발자

## 🛠 문제 해결

### Chrome 드라이버 오류
```bash
# Chrome 버전 확인
docker exec skillmap-crawler google-chrome --version
docker exec skillmap-crawler chromedriver --version
```

### MongoDB 연결 오류
```bash
# MongoDB 컨테이너 상태 확인
docker-compose ps
docker-compose logs mongodb
```

### 메모리 부족
```bash
# Docker 메모리 할당 확인 (최소 4GB 권장)
docker system info | grep Memory
```

## 🚮 정리

```bash
# 컨테이너 및 볼륨 정리
docker-compose down -v

# 이미지까지 완전 삭제
docker-compose down -v --rmi all
```

## 📈 성능 최적화

- **Chrome 헤드리스 모드**: 빠른 크롤링
- **비동기 처리**: 동시 크롤링
- **MongoDB 인덱싱**: 빠른 데이터 조회
- **중복 제거**: 동일 공고 필터링

---

**✨ 모든 개선사항이 적용된 완전한 크롤링 시스템을 Docker로 간편하게 실행하세요!**