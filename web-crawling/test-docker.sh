#!/bin/bash

echo "=== SkillMap Docker 환경 테스트 ==="

# Docker 및 Docker Compose 버전 확인
echo "1. Docker 환경 확인..."
docker --version
docker-compose --version

# 기존 컨테이너 정리
echo "2. 기존 컨테이너 정리..."
docker-compose down -v --remove-orphans

# 이미지 빌드 및 실행
echo "3. Docker Compose 빌드 및 실행..."
docker-compose up --build -d

# 컨테이너 상태 확인
echo "4. 컨테이너 상태 확인..."
sleep 10
docker-compose ps

# MongoDB 연결 테스트
echo "5. MongoDB 연결 테스트..."
sleep 5
docker exec skillmap-mongodb mongosh --eval "db.adminCommand('ismaster')" || echo "MongoDB 연결 대기 중..."

# 크롤러 로그 확인
echo "6. 크롤러 실행 로그 (30초)..."
timeout 30 docker-compose logs -f web-crawler || echo "로그 확인 완료"

# 서비스 URL 안내
echo ""
echo "=== 서비스 접속 정보 ==="
echo "• MongoDB UI: http://localhost:8081 (admin/skillmap123)"
echo "• 결과 파일: ./output/crawl_results.json"
echo "• 로그 확인: docker-compose logs web-crawler"
echo ""
echo "=== 정리 명령어 ==="
echo "• 중지: docker-compose down"
echo "• 완전삭제: docker-compose down -v --rmi all"