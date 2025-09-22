const CrawledJob = require('../models/CrawledJob');

const testJobs = [
  {
    id: 'test-job-1',
    title: '프론트엔드 개발자 (React/Next.js)',
    company_name: '네이버',
    work_location: '경기 성남시 분당구',
    keywords: ['React', 'JavaScript', 'TypeScript', 'Next.js', 'Redux'],
    salary_range: '4000-6000만원',
    job_category: 'IT/개발',
    quality_score: 0.9,
    description: '네이버 검색 서비스의 프론트엔드 개발을 담당할 개발자를 모집합니다. 사용자 경험 최적화와 성능 향상에 관심이 많으신 분을 찾습니다.',
    requirements: '• React.js 3년 이상 실무 경험\n• TypeScript 2년 이상 사용 경험\n• 웹 성능 최적화 경험\n• Git을 이용한 협업 경험',
    benefits: '• 연봉 상승률 연평균 10% 이상\n• 개발자 도서/컨퍼런스 비용 지원\n• 맥북 프로 지급\n• 유연근무제',
    experience_level: '경력',
    source_site: 'saramin',
    source_url: 'https://example.com/job1',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-2',
    title: '백엔드 개발자 (Node.js/AWS)',
    company_name: '카카오',
    work_location: '제주 제주시',
    keywords: ['Node.js', 'Express', 'MongoDB', 'AWS', 'Redis'],
    salary_range: '5000-7000만원',
    job_category: 'IT/개발',
    quality_score: 0.85,
    description: '카카오톡 메시징 서비스 백엔드 개발을 담당하실 개발자를 모집합니다. 대용량 트래픽 처리 경험이 있으신 분을 우대합니다.',
    requirements: '• Node.js 3년 이상 실무 경험\n• 대용량 서비스 개발 경험\n• AWS 클라우드 서비스 사용 경험\n• 데이터베이스 설계 및 최적화 경험',
    benefits: '• 스톡옵션 제공\n• 제주도 근무 환경\n• 중식/석식 제공\n• 워케이션 프로그램',
    experience_level: '경력',
    source_site: 'worknet',
    source_url: 'https://example.com/job2',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-3',
    title: '풀스택 개발자 (금융서비스)',
    company_name: '토스',
    work_location: '서울 강남구',
    keywords: ['React', 'Node.js', 'TypeScript', 'Docker', 'Kubernetes'],
    salary_range: '6000-8000만원',
    job_category: 'IT/개발',
    quality_score: 0.95,
    description: '토스 페이먼츠 서비스 개발을 담당할 풀스택 개발자를 모집합니다. 혁신적인 금융 서비스를 만들어가실 분을 찾습니다.',
    requirements: '• 풀스택 개발 3년 이상 경험\n• 금융권 서비스 개발 경험 우대\n• 마이크로서비스 아키텍처 이해\n• 컨테이너 기반 배포 경험',
    benefits: '• 재택근무 가능 (주 3일)\n• 점심/저녁 식사 제공\n• 최신 개발 장비 지원\n• 성과급 별도 지급',
    experience_level: '경력',
    source_site: 'comento',
    source_url: 'https://example.com/job3',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-4',
    title: '신입 백엔드 개발자',
    company_name: '우아한형제들',
    work_location: '서울 송파구',
    keywords: ['Java', 'Spring', 'MySQL', 'Git', 'JPA'],
    salary_range: '3500-4200만원',
    job_category: 'IT/개발',
    quality_score: 0.8,
    description: '배달의민족 서비스 백엔드 개발에 참여할 신입 개발자를 모집합니다. 체계적인 신입 교육 프로그램을 제공합니다.',
    requirements: '• 컴퓨터공학 또는 관련 학과 졸업\n• Java 프로그래밍 기초 지식\n• 데이터베이스 기초 지식\n• 학습 의지가 강한 분',
    benefits: '• 3개월 신입 교육 프로그램\n• 멘토링 시스템\n• 사내 카페테리아\n• 개발서적 구입비 지원',
    experience_level: '신입',
    source_site: 'saramin',
    source_url: 'https://example.com/job4',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-5',
    title: 'DevOps 엔지니어 (클라우드)',
    company_name: '라인',
    work_location: '서울 강남구',
    keywords: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    salary_range: '5500-7500만원',
    job_category: 'IT/개발',
    quality_score: 0.88,
    description: '라인 메신저 인프라 운영 및 개발을 담당할 DevOps 엔지니어를 모집합니다. 글로벌 서비스의 안정적인 운영에 기여하실 분을 찾습니다.',
    requirements: '• AWS 클라우드 운영 2년 이상 경험\n• Docker/Kubernetes 실무 경험\n• CI/CD 파이프라인 구축 경험\n• 모니터링 시스템 구축 경험',
    benefits: '• 교육비 전액 지원\n• 해외 컨퍼런스 참가 지원\n• 건강검진 지원\n• 장기근속 인센티브',
    experience_level: '경력',
    source_site: 'worknet',
    source_url: 'https://example.com/job5',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-6',
    title: 'AI/ML 엔지니어 (연구개발)',
    company_name: 'LG전자',
    work_location: '서울 금천구',
    keywords: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
    salary_range: '6000-9000만원',
    job_category: 'IT/개발',
    quality_score: 0.92,
    description: 'LG전자 AI연구소에서 차세대 AI 기술 개발을 담당할 AI/ML 엔지니어를 모집합니다. 혁신적인 AI 제품 개발에 참여하실 분을 찾습니다.',
    requirements: '• AI/ML 관련 석사 이상 학위\n• TensorFlow/PyTorch 3년 이상 경험\n• 논문 게재 또는 특허 출원 경험\n• 영어 커뮤니케이션 가능',
    benefits: '• 연구개발비 별도 지원\n• 논문 게재 인센티브\n• 해외 연수 기회\n• 특허 출원 보상금',
    experience_level: '경력',
    source_site: 'comento',
    source_url: 'https://example.com/job6',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-7',
    title: '데이터 사이언티스트',
    company_name: '삼성전자',
    work_location: '경기 수원시',
    keywords: ['Python', 'R', 'SQL', 'Tableau', 'Spark'],
    salary_range: '5000-7000만원',
    job_category: 'IT/개발',
    quality_score: 0.87,
    description: '삼성전자 경영진단팀에서 비즈니스 인사이트 도출을 담당할 데이터 사이언티스트를 모집합니다.',
    requirements: '• 통계학/수학 관련 학위\n• Python/R 데이터 분석 3년 이상\n• 머신러닝 모델링 경험\n• 비즈니스 도메인 이해',
    benefits: '• 대기업 복리후생\n• 자기계발비 지원\n• 사내 동호회 활동\n• 정시퇴근 문화',
    experience_level: '경력',
    source_site: 'saramin',
    source_url: 'https://example.com/job7',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-8',
    title: '모바일 앱 개발자 (iOS)',
    company_name: '배달의민족',
    work_location: '서울 송파구',
    keywords: ['Swift', 'iOS', 'UIKit', 'SwiftUI', 'RxSwift'],
    salary_range: '4500-6500만원',
    job_category: 'IT/개발',
    quality_score: 0.89,
    description: '배달의민족 iOS 앱 개발을 담당할 모바일 개발자를 모집합니다. 수백만 사용자가 이용하는 앱 개발에 참여하세요.',
    requirements: '• iOS 네이티브 앱 개발 2년 이상\n• Swift 언어 숙련도\n• App Store 앱 출시 경험\n• UI/UX에 대한 이해',
    benefits: '• 점심/저녁 식사 제공\n• 간식 무제한 제공\n• 개발자 장비 지원\n• 야근 택시비 지원',
    experience_level: '경력',
    source_site: 'worknet',
    source_url: 'https://example.com/job8',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-9',
    title: '게임 클라이언트 개발자',
    company_name: 'NCSoft',
    work_location: '경기 성남시 분당구',
    keywords: ['Unity', 'C#', 'Unreal Engine', 'DirectX', 'OpenGL'],
    salary_range: '4000-6000만원',
    job_category: 'IT/개발',
    quality_score: 0.84,
    description: 'MMORPG 신작 개발을 담당할 게임 클라이언트 개발자를 모집합니다. 혁신적인 게임 경험을 만들어갈 개발자를 찾습니다.',
    requirements: '• Unity 또는 Unreal Engine 경험 2년 이상\n• C# 또는 C++ 프로그래밍 숙련도\n• 3D 그래픽스 프로그래밍 이해\n• 게임 개발에 대한 열정',
    benefits: '• 게임 개발 장비 지원\n• 크런치 타임 보상휴가\n• 게임 구매비 지원\n• 개발팀 워크샵',
    experience_level: '경력',
    source_site: 'comento',
    source_url: 'https://example.com/job9',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-10',
    title: '보안 엔지니어',
    company_name: 'SK텔레콤',
    work_location: '서울 중구',
    keywords: ['Network Security', 'Firewall', 'IDS/IPS', 'Python', 'Linux'],
    salary_range: '5000-7500만원',
    job_category: 'IT/개발',
    quality_score: 0.91,
    description: 'SK텔레콤 보안관제센터에서 인프라 보안을 담당할 보안 엔지니어를 모집합니다.',
    requirements: '• 정보보안 관련 학위 또는 자격증\n• 네트워크 보안 장비 운영 경험\n• 보안 사고 대응 경험\n• 리눅스 시스템 관리 경험',
    benefits: '• 보안 자격증 취득 지원\n• 24시간 근무 수당\n• 정보보안 컨퍼런스 참가 지원\n• 보안 교육 프로그램',
    experience_level: '경력',
    source_site: 'securityfarm',
    source_url: 'https://example.com/job10',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-11',
    title: '신입 프론트엔드 개발자',
    company_name: '스타트업 코드스테이츠',
    work_location: '서울 강남구',
    keywords: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    salary_range: '3000-3800만원',
    job_category: 'IT/개발',
    quality_score: 0.75,
    description: '부트캠프 플랫폼 개발을 담당할 신입 프론트엔드 개발자를 모집합니다. 성장 의지가 강한 분을 찾습니다.',
    requirements: '• 컴퓨터공학 관련 전공 또는 부트캠프 수료\n• React 기초 지식\n• HTML/CSS/JavaScript 기본기\n• Git 사용 경험',
    benefits: '• 스타트업 경험 및 성장 기회\n• 멘토링 프로그램\n• 자유로운 근무 분위기\n• 스톡옵션 지급',
    experience_level: '신입',
    source_site: 'saramin',
    source_url: 'https://example.com/job11',
    is_active: true,
    processing_status: 'processed'
  },
  {
    id: 'test-job-12',
    title: '클라우드 아키텍트',
    company_name: '현대자동차',
    work_location: '서울 강남구',
    keywords: ['AWS', 'Azure', 'Terraform', 'Ansible', 'MSA'],
    salary_range: '7000-10000만원',
    job_category: 'IT/개발',
    quality_score: 0.94,
    description: '현대자동차 디지털 트랜스포메이션을 이끌 클라우드 아키텍트를 모집합니다.',
    requirements: '• 클라우드 아키텍처 설계 5년 이상\n• AWS/Azure 전문가 자격증 보유\n• 마이크로서비스 아키텍처 경험\n• 대규모 시스템 마이그레이션 경험',
    benefits: '• 임원급 대우\n• 자동차 구매 할인\n• 해외 파견 기회\n• 주식 인센티브',
    experience_level: '경력',
    source_site: 'worknet',
    source_url: 'https://example.com/job12',
    is_active: true,
    processing_status: 'processed'
  }
];

async function seedTestData() {
  try {
    // 기존 테스트 데이터 삭제
    await CrawledJob.deleteMany({ id: { $regex: '^test-job-' } });

    // 새 테스트 데이터 추가
    const result = await CrawledJob.insertMany(testJobs);
    console.log(`✅ ${result.length} test jobs added successfully`);

    return result;
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

module.exports = { seedTestData, testJobs };