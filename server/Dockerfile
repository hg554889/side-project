# 사용할 기본 이미지 지정
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 목록 복사
COPY package*.json ./

# 패키지 설치
RUN npm install

# 모든 소스 코드 복사
COPY . .

# 애플리케이션 실행
CMD ["npm", "start"]