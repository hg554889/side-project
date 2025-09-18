/**
 * Mock Data for SkillMap Application
 * 실제 API 연동 전까지 사용할 Mock 데이터들
 */

// Mock company data for MainPage cards
export const mockCompanies = [
  {
    id: 1,
    name: '네이버',
    position: '프론트엔드 개발자',
    skills: ['React', 'JavaScript', 'TypeScript'],
    region: '서울',
    companySize: '대기업',
    experienceLevel: '신입',
    salary: '3500-4500만원',
  },
  {
    id: 2,
    name: '카카오',
    position: '백엔드 개발자',
    skills: ['Node.js', 'MongoDB', 'AWS'],
    region: '서울',
    companySize: '대기업',
    experienceLevel: '1-3년차',
    salary: '4000-6000만원',
  },
  {
    id: 3,
    name: '토스',
    position: '풀스택 개발자',
    skills: ['React', 'Python', 'Django'],
    region: '서울',
    companySize: '중견기업',
    experienceLevel: '신입',
    salary: '3000-4000만원',
  },
  {
    id: 4,
    name: '쿠팡',
    position: 'DevOps 엔지니어',
    skills: ['Docker', 'Kubernetes', 'AWS'],
    region: '서울',
    companySize: '대기업',
    experienceLevel: '1-3년차',
    salary: '4500-7000만원',
  },
  {
    id: 5,
    name: '배달의민족',
    position: 'UI/UX 디자이너',
    skills: ['Figma', 'Sketch', 'Photoshop'],
    region: '서울',
    companySize: '대기업',
    experienceLevel: '신입',
    salary: '3200-4200만원',
  },
  {
    id: 6,
    name: '당근마켓',
    position: '마케팅 매니저',
    skills: ['Google Analytics', 'Facebook 광고', 'SQL'],
    region: '서울',
    companySize: '중견기업',
    experienceLevel: '1-3년차',
    salary: '3500-5000만원',
  },
  {
    id: 7,
    name: '크래프톤',
    position: '게임 개발자',
    skills: ['Unity', 'C#', 'C++'],
    region: '서울',
    companySize: '대기업',
    experienceLevel: '신입',
    salary: '3800-5500만원',
  },
  {
    id: 8,
    name: '엔씨소프트',
    position: '데이터 분석가',
    skills: ['Python', 'SQL', 'Tableau'],
    region: '서울',
    companySize: '대기업',
    experienceLevel: '경력무관',
    salary: '4000-6500만원',
  },
  {
    id: 9,
    name: '라인',
    position: '모바일 개발자',
    skills: ['React Native', 'Swift', 'Kotlin'],
    region: '서울',
    companySize: '대기업',
    experienceLevel: '1-3년차',
    salary: '4200-6200만원',
  },
  {
    id: 10,
    name: '야놀자',
    position: '서비스 기획자',
    skills: ['기획', 'SQL', 'Excel'],
    region: '서울',
    companySize: '중견기업',
    experienceLevel: '신입',
    salary: '3300-4300만원',
  },
  {
    id: 11,
    name: '비바리퍼블리카',
    position: '보안 엔지니어',
    skills: ['보안', 'Python', '취약점분석'],
    region: '서울',
    companySize: '중견기업',
    experienceLevel: '1-3년차',
    salary: '4500-6500만원',
  },
  {
    id: 12,
    name: '버즈빌',
    position: '광고 기획자',
    skills: ['광고기획', 'Google Ads', '데이터분석'],
    region: '서울',
    companySize: '스타트업',
    experienceLevel: '신입',
    salary: '3000-3800만원',
  },
];

// Mock analysis results for AnalysisPage
export const mockAnalysisResults = [
  {
    id: 1,
    title: '핵심 기술 스택 분석',
    description:
      'React(85%), JavaScript(92%), TypeScript(67%) 순으로 높은 요구도를 보임',
    trend: 'up',
    category: 'skills',
    details: [
      '가장 많이 요구되는 기술: JavaScript (92%)',
      'React 요구 비율이 전년대비 15% 증가',
      'TypeScript 도입 기업이 67%로 늘어남',
    ],
  },
  {
    id: 2,
    title: '신입 vs 주니어 요구사항',
    description: '신입: 기본 문법 중심, 주니어: 프레임워크 실무 경험 요구',
    trend: 'stable',
    category: 'experience',
    details: [
      '신입: 알고리즘, 자료구조, 기본 문법 중시',
      '주니어: 실무 프로젝트 경험, 협업 스킬 요구',
      '포트폴리오 프로젝트 평균 2-3개 필요',
    ],
  },
  {
    id: 3,
    title: '학습 우선순위',
    description: '1. JavaScript 기본기 2. React 실무 3. 프로젝트 경험',
    trend: 'up',
    category: 'learning',
    details: [
      'JavaScript ES6+ 문법 숙지 필수',
      'React Hooks, Context API 활용 능력',
      '개인 프로젝트보다 팀 프로젝트 경험 선호',
    ],
  },
  {
    id: 4,
    title: '예상 연봉 범위',
    description: '신입: 3000-4000만원, 1-3년차: 4000-5500만원',
    trend: 'up',
    category: 'salary',
    details: [
      '신입 평균 연봉: 3,500만원',
      '1-3년차 평균 연봉: 4,800만원',
      '대기업 vs 스타트업 격차 약 500만원',
    ],
  },
];

// Job categories with subcategories for analysis settings
export const jobCategories = {
  'IT/개발': {
    subcategories: [
      '프론트엔드',
      '백엔드',
      '풀스택',
      '모바일',
      'DevOps',
      'AI/ML',
      '데이터',
    ],
    keywords: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', '알고리즘'],
  },
  마케팅: {
    subcategories: [
      '디지털마케팅',
      '퍼포먼스마케팅',
      '브랜드마케팅',
      '콘텐츠마케팅',
    ],
    keywords: ['Google Analytics', 'Facebook 광고', 'SEO', 'SQL', '데이터분석'],
  },
  디자인: {
    subcategories: ['UI/UX', '그래픽디자인', '웹디자인', '앱디자인'],
    keywords: ['Figma', 'Adobe Creative Suite', '사용자경험', '와이어프레임'],
  },
  기획: {
    subcategories: ['서비스기획', '사업기획', '전략기획', 'PM'],
    keywords: ['프로젝트관리', '비즈니스모델', '데이터분석', 'SQL', 'Jira'],
  },
  '영업/세일즈': {
    subcategories: ['B2B영업', 'B2C영업', '해외영업', '기술영업'],
    keywords: ['CRM', '협상력', '프레젠테이션', '고객관리', '매출관리'],
  },
  보안: {
    subcategories: ['정보보안', '디지털포렌식', '클라우드보안', '인프라보안'],
    keywords: ['네트워크보안', '취약점분석', 'Python', '로그분석', 'CISSP'],
  },
  금융: {
    subcategories: ['투자', '리스크관리', '회계', '재무분석'],
    keywords: ['Excel', 'VBA', 'SQL', '재무모델링', 'CPA', 'FRM'],
  },
};

// Auto-slide notifications for Header
export const notifications = [
  {
    id: 1,
    message: '🔥 신규 AI 분석 엔진 업데이트!',
    type: 'update',
    priority: 'high',
  },
  {
    id: 2,
    message: '📊 IT 직군 분석 정확도 95% 달성',
    type: 'achievement',
    priority: 'medium',
  },
  {
    id: 3,
    message: '🎯 개인 맞춤 학습 플랜 서비스 오픈',
    type: 'feature',
    priority: 'high',
  },
  {
    id: 4,
    message: '💡 새로운 직군 분석 기능 추가 예정',
    type: 'preview',
    priority: 'low',
  },
];

// Filter options
export const filterOptions = {
  experienceLevel: [
    { value: '', label: '전체' },
    { value: '신입', label: '신입' },
    { value: '1-3년차', label: '1-3년차' },
    { value: '경력무관', label: '경력무관' },
  ],
  region: [
    { value: '', label: '전체' },
    { value: '서울', label: '서울' },
    { value: '경기', label: '경기' },
    { value: '부산', label: '부산' },
    { value: '대구', label: '대구' },
    { value: '인천', label: '인천' },
  ],
  companySize: [
    { value: '', label: '전체' },
    { value: '스타트업', label: '스타트업' },
    { value: '중견기업', label: '중견기업' },
    { value: '대기업', label: '대기업' },
  ],
};

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  JOBS: '/jobs',
  ANALYSIS: '/analysis',
  CRAWLING: '/crawling',
};

// ==== 새로운 Mock 데이터들 ====

// 트렌딩 스킬 데이터
export const mockTrendingSkills = [
  {
    id: 1,
    name: 'React',
    category: 'Frontend',
    demandGrowth: '+15%',
    avgSalary: '4500만원',
    jobCount: 1250,
    trend: 'hot',
    description: '가장 인기 있는 프론트엔드 라이브러리',
  },
  {
    id: 2,
    name: 'Python',
    category: 'Backend/AI',
    demandGrowth: '+22%',
    avgSalary: '5200만원',
    jobCount: 980,
    trend: 'hot',
    description: 'AI/ML 및 백엔드 개발의 핵심',
  },
  {
    id: 3,
    name: 'TypeScript',
    category: 'Frontend',
    demandGrowth: '+35%',
    avgSalary: '4800만원',
    jobCount: 850,
    trend: 'rising',
    description: '안전한 JavaScript 개발의 필수',
  },
  {
    id: 4,
    name: 'AWS',
    category: 'DevOps',
    demandGrowth: '+18%',
    avgSalary: '5500만원',
    jobCount: 920,
    trend: 'hot',
    description: '클라우드 서비스의 선두주자',
  },
  {
    id: 5,
    name: 'Next.js',
    category: 'Frontend',
    demandGrowth: '+45%',
    avgSalary: '4700만원',
    jobCount: 420,
    trend: 'rising',
    description: 'React 기반 풀스택 프레임워크',
  },
];

// 분석 히스토리 데이터
export const mockAnalysisHistory = [
  {
    id: 'analysis_001',
    jobCategory: 'IT/개발',
    experienceLevel: '신입',
    region: '서울',
    createdAt: '2024-01-15T09:30:00Z',
    status: 'completed',
    summary: 'React 개발자 신입 분석 결과',
  },
  {
    id: 'analysis_002',
    jobCategory: '마케팅',
    experienceLevel: '1-3년차',
    region: '서울',
    createdAt: '2024-01-12T14:20:00Z',
    status: 'completed',
    summary: '디지털마케팅 경력 분석 결과',
  },
  {
    id: 'analysis_003',
    jobCategory: 'IT/개발',
    experienceLevel: '1-3년차',
    region: '경기',
    createdAt: '2024-01-10T11:45:00Z',
    status: 'completed',
    summary: '백엔드 개발자 주니어 분석 결과',
  },
];

// 연봉 인사이트 데이터
export const mockSalaryInsights = {
  summary: {
    avgSalary: '4200만원',
    salaryRange: { min: 3000, max: 6500 },
    salaryGrowth: '+8.5%',
  },
  byExperience: [
    { level: '신입', min: 3000, max: 4500, avg: 3750 },
    { level: '1-3년차', min: 4000, max: 6000, avg: 5000 },
    { level: '4-6년차', min: 5500, max: 8000, avg: 6750 },
    { level: '7년차+', min: 7000, max: 12000, avg: 9500 },
  ],
  byCompanySize: [
    { size: '스타트업', min: 3000, max: 5500, avg: 4250 },
    { size: '중견기업', min: 3500, max: 6500, avg: 5000 },
    { size: '대기업', min: 4000, max: 8000, avg: 6000 },
  ],
  byRegion: [
    { region: '서울', avg: 4800, growth: '+10%' },
    { region: '경기', avg: 4200, growth: '+7%' },
    { region: '부산', avg: 3600, growth: '+5%' },
    { region: '대구', avg: 3400, growth: '+4%' },
  ],
};

// 시장 동향 데이터
export const mockMarketOverview = {
  totalJobs: 12845,
  growthRate: '+12%',
  hotSkills: [
    { name: 'AI/ML', growth: '+45%' },
    { name: 'React', growth: '+15%' },
    { name: 'Python', growth: '+22%' },
    { name: 'Kubernetes', growth: '+38%' },
  ],
  emergingRoles: [
    'AI 엔지니어',
    'DevOps 엔지니어',
    'Product Manager',
    'Data Scientist',
  ],
  topCompanies: [
    { name: '네이버', openings: 245 },
    { name: '카카오', openings: 189 },
    { name: '토스', openings: 156 },
    { name: '당근마켓', openings: 134 },
  ],
};

// 학습 경로 데이터
export const mockLearningPaths = [
  {
    id: 1,
    title: 'React 개발자 로드맵',
    description: '신입 React 개발자를 위한 체계적인 학습 계획',
    duration: '6개월',
    difficulty: 'Beginner',
    steps: [
      {
        phase: 1,
        title: 'JavaScript 기초',
        duration: '4주',
        topics: ['ES6+ 문법', '비동기 처리', 'DOM 조작'],
        resources: ['MDN 문서', 'JavaScript.info', '모던 자바스크립트 튜토리얼'],
      },
      {
        phase: 2,
        title: 'React 기초',
        duration: '6주',
        topics: ['컴포넌트', 'State & Props', 'Event Handling'],
        resources: ['React 공식 문서', 'React 개발 바이블', '실전 리액트 프로그래밍'],
      },
      {
        phase: 3,
        title: 'React 심화',
        duration: '6주',
        topics: ['Hooks', 'Context API', 'Performance'],
        resources: ['React Hooks 완벽 가이드', 'Advanced React Patterns'],
      },
      {
        phase: 4,
        title: '프로젝트 실습',
        duration: '6주',
        topics: ['Todo App', 'E-commerce', 'Social Media'],
        resources: ['GitHub Projects', 'Portfolio 제작'],
      },
    ],
    prerequisites: ['HTML/CSS 기초', '프로그래밍 기초 지식'],
    outcomes: ['React 앱 개발', '포트폴리오 3개', '취업 준비 완료'],
  },
  {
    id: 2,
    title: 'Python 백엔드 개발자',
    description: '파이썬을 활용한 백엔드 개발자 양성 과정',
    duration: '8개월',
    difficulty: 'Intermediate',
    steps: [
      {
        phase: 1,
        title: 'Python 기초',
        duration: '4주',
        topics: ['문법', '자료구조', 'OOP'],
        resources: ['점프 투 파이썬', 'Python.org 튜토리얼'],
      },
      {
        phase: 2,
        title: 'Django/FastAPI',
        duration: '8주',
        topics: ['웹 프레임워크', 'REST API', '데이터베이스'],
        resources: ['Django 공식 문서', 'FastAPI 가이드'],
      },
      {
        phase: 3,
        title: '데이터베이스 & 배포',
        duration: '6주',
        topics: ['PostgreSQL', 'Redis', 'Docker', 'AWS'],
        resources: ['AWS 문서', 'Docker 공식 가이드'],
      },
      {
        phase: 4,
        title: '고급 주제',
        duration: '6週',
        topics: ['마이크로서비스', '테스팅', '성능 최적화'],
        resources: ['시스템 디자인 인터뷰', 'Clean Architecture'],
      },
    ],
    prerequisites: ['프로그래밍 기초', '데이터베이스 기본 개념'],
    outcomes: ['백엔드 API 개발', 'AWS 배포', '실무 프로젝트 경험'],
  },
  {
    id: 3,
    title: 'AI/ML 엔지니어',
    description: '인공지능/머신러닝 전문가 양성 과정',
    duration: '12개월',
    difficulty: 'Advanced',
    steps: [
      {
        phase: 1,
        title: '수학 & 통계 기초',
        duration: '8주',
        topics: ['선형대수', '확률론', '통계학'],
        resources: ['Khan Academy', '통계학 입문서'],
      },
      {
        phase: 2,
        title: 'Python & 라이브러리',
        duration: '6주',
        topics: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
        resources: ['Pandas 공식 문서', 'Scikit-learn 튜토리얼'],
      },
      {
        phase: 3,
        title: '머신러닝',
        duration: '10주',
        topics: ['지도학습', '비지도학습', '모델 평가'],
        resources: ['Hands-On ML', 'Andrew Ng 강의'],
      },
      {
        phase: 4,
        title: '딥러닝',
        duration: '12주',
        topics: ['Neural Networks', 'CNN', 'RNN', 'Transformer'],
        resources: ['Deep Learning Book', 'PyTorch 튜토리얼'],
      },
      {
        phase: 5,
        title: '실전 프로젝트',
        duration: '12주',
        topics: ['CV 프로젝트', 'NLP 프로젝트', 'MLOps'],
        resources: ['Kaggle', 'Papers With Code'],
      },
    ],
    prerequisites: ['Python 기초', '수학 기본 지식'],
    outcomes: ['ML 모델 개발', 'AI 서비스 구축', '연구 논문 이해'],
  },
];
