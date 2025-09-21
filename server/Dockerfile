# 사용할 기본 이미지 지정
FROM node:18-alpine

# 1. Client 빌드 스테이지
FROM node:18-alpine AS client-builder

WORKDIR /client
COPY ../client/package*.json ./
RUN npm install
COPY ../client/ ./
RUN npm run build

# 2. Server 런타임 스테이지
FROM node:18-alpine

WORKDIR /app

# Client 빌드 결과물 복사
COPY --from=client-builder /client/dist ./client/dist

# 서버의 package.json 파일만 복사
COPY server/package*.json ./

# 패키지 설치
RUN npm install

# 서버 소스 코드만 복사
COPY server/ .

# 애플리케이션 실행
CMD ["npm", "start"]