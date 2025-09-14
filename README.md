# Side Project Collection

다양한 기술 스택을 활용한 멀티 프로젝트 저장소

## 📁 프로젝트 구조

```
side-project/
├── client/          # 🌐 React.js Frontend (Vite + JavaScript)
├── server/          # 🚀 Express.js Backend (Node.js)
├── web-crawling/    # 🕷️ Python Web Crawling
├── ai/              # 🤖 AI/ML Python
└── .gitignore       # Git ignore rules for all projects
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) for client/server
- **Python** (v3.8 or higher) for web-crawling/ai projects

### 1. Frontend (React.js + Vite)

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

### 2. Backend (Express.js)

```bash
cd server
npm install
npm run dev          # http://localhost:3000
```

### 3. Web Crawling (Python)

```bash
cd web-crawling

# Manual setup
python -m venv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate.bat
pip install -r requirements.txt
```

### 4. AI/ML Projects (Python)

```bash
cd ai
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate.bat
pip install -r requirements.txt  # (if available)
```

## 🛠️ 기술 스택

### Frontend

- **React.js** - UI 라이브러리
- **Vite** - 빌드 도구 및 개발 서버
- **JavaScript** - 타입 안전성
- **ESLint + Prettier** - 코드 품질 및 포매팅

### Backend

- **Express.js** - Node.js 웹 프레임워크
- **Nodemon** - 개발 서버 자동 재시작

### Data & Automation

- **Python** - 데이터 처리 및 자동화

## 📜 사용 가능한 스크립트

### Client (React)

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run lint         # ESLint 검사
npm run format       # Prettier 포매팅
```

### Server (Express)

```bash
npm start            # 프로덕션 실행
npm run dev          # 개발 모드 (nodemon)
npm run format       # Prettier 포매팅
```

### Web Crawling (Python)

```bash
# 가상환경 활성화 후
python 파일_이름.py
```

## 🤝 개발 가이드

### 새로운 팀원을 위한 설정

1. 저장소 클론

   ```bash
   git clone <repository-url>
   cd side-project
   ```

2. 필요한 프로젝트의 설정 스크립트 실행
   - React + Express: `npm install` in respective folders
   - Python projects: 가상환경 설정 및 python 파일\_이름.py 명령어로 실행

### Git 브랜치 전략

- `main` - 프로덕션 브랜치
- `develop` - 개발 브랜치
- `feature/*` - 기능 개발 브랜치

### 코드 스타일

- **JavaScript**: ESLint + Prettier 설정 준수
- **Python**: PEP 8 가이드라인 준수

## 🔧 개발 환경 설정

### IDE 추천 설정

- **VS Code Extensions**:
  - ES7+ React snippets
  - Prettier
  - ESLint
  - Python
  - Python Debugger

### 환경변수 설정 - 추후 예정

각 프로젝트 디렉토리에 `.env` 파일 생성:

```bash
# client/.env
VITE_API_BASE_URL=http://localhost:3000

# server/.env
PORT=3000
NODE_ENV=development

# web-crawling/.env
# Your API keys and configurations
```
