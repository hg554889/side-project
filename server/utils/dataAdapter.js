/**
 * Data Adapter for converting between different data formats
 * 크롤링 데이터와 기존 UI 호환성을 위한 데이터 변환 어댑터
 */

/**
 * Convert crawled job data to legacy JobPosting format
 * @param {Object} crawledJob - CrawledJob 모델 데이터
 * @returns {Object} 기존 UI 호환 형태의 JobPosting 데이터
 */
const convertCrawledJobToLegacy = (crawledJob) => {
  if (!crawledJob) return null;

  // 경험 수준 매핑
  const experienceLevelMapping = {
    '신입': '신입',
    '경력': '1-3년차',
    '경력무관': '경력무관',
    '인턴': '신입'
  };

  // 회사 규모 추정 (임시 로직 - 나중에 개선 필요)
  const estimateCompanySize = (companyName) => {
    const largeCorp = ['삼성', '네이버', 'LG', 'SK', '현대', '카카오', '쿠팡', 'NHN'];
    const midCorp = ['토스', '배달의민족', '당근마켓', '야놀자', '마켓컬리'];

    if (largeCorp.some(corp => companyName.includes(corp))) return '대기업';
    if (midCorp.some(corp => companyName.includes(corp))) return '중견기업';
    return '스타트업';
  };

  // 지역 정리 (서울/경기/부산 등으로 단순화)
  const normalizeRegion = (location) => {
    if (!location) return '기타';

    const locationLower = location.toLowerCase();
    if (locationLower.includes('서울')) return '서울';
    if (locationLower.includes('경기') || locationLower.includes('수원') || locationLower.includes('성남')) return '경기';
    if (locationLower.includes('부산')) return '부산';
    if (locationLower.includes('대구')) return '대구';
    if (locationLower.includes('인천')) return '인천';
    if (locationLower.includes('광주')) return '광주';
    if (locationLower.includes('대전')) return '대전';
    if (locationLower.includes('울산')) return '울산';
    if (locationLower.includes('세종')) return '세종';

    return '기타';
  };

  return {
    // ID 매핑
    id: crawledJob.id || crawledJob._id,
    _id: crawledJob._id,

    // 기본 정보 매핑
    jobTitle: crawledJob.title || '',
    companyName: crawledJob.company_name || '',

    // 카테고리 매핑 (기존 enum에 맞게 조정)
    jobCategory: crawledJob.job_category || 'IT/개발',

    // 경험 수준 매핑
    experienceLevel: experienceLevelMapping[crawledJob.experience_level] || '경력무관',

    // 위치 정보 매핑
    region: normalizeRegion(crawledJob.work_location),
    detailedLocation: crawledJob.work_location || '',

    // 회사 정보 추정
    companySize: estimateCompanySize(crawledJob.company_name || ''),

    // 스킬 및 키워드
    keywords: crawledJob.keywords || [],

    // 급여 정보
    salaryText: crawledJob.salary_range || '협의',
    salaryMin: extractSalaryMin(crawledJob.salary_range),
    salaryMax: extractSalaryMax(crawledJob.salary_range),

    // 상세 정보
    jobDescription: crawledJob.description || '',
    requirements: crawledJob.requirements || '',
    benefits: crawledJob.benefits || '',

    // 메타 정보
    source: crawledJob.source_site || '',
    sourceUrl: crawledJob.source_url || '',
    qualityScore: crawledJob.quality_score || 0,

    // 시간 정보
    crawledAt: crawledJob.scraped_at || crawledJob.createdAt || new Date(),
    createdAt: crawledJob.createdAt || crawledJob.scraped_at || new Date(),
    updatedAt: crawledJob.updatedAt || new Date(),

    // 상태
    isActive: crawledJob.is_active !== false, // default true

    // 추가 호환성 필드들
    name: crawledJob.company_name, // mockCompanies 호환
    position: crawledJob.title, // mockCompanies 호환
    skills: crawledJob.keywords || [], // mockCompanies 호환
    salary: crawledJob.salary_range || '협의', // mockCompanies 호환
  };
};

/**
 * 급여 문자열에서 최소값 추출
 */
const extractSalaryMin = (salaryRange) => {
  if (!salaryRange || typeof salaryRange !== 'string') return null;

  // "3000-4000만원", "3000만원 이상" 등의 패턴 처리
  const numberPattern = /(\d{1,4})/g;
  const matches = salaryRange.match(numberPattern);

  if (matches && matches.length > 0) {
    return parseInt(matches[0]) * 10000; // 만원 단위를 원 단위로
  }

  return null;
};

/**
 * 급여 문자열에서 최대값 추출
 */
const extractSalaryMax = (salaryRange) => {
  if (!salaryRange || typeof salaryRange !== 'string') return null;

  const numberPattern = /(\d{1,4})/g;
  const matches = salaryRange.match(numberPattern);

  if (matches && matches.length > 1) {
    return parseInt(matches[1]) * 10000; // 만원 단위를 원 단위로
  } else if (matches && matches.length === 1) {
    // 단일 값인 경우 최대값도 동일하게 설정
    return parseInt(matches[0]) * 10000;
  }

  return null;
};

/**
 * Convert multiple crawled jobs to legacy format
 * @param {Array} crawledJobs - CrawledJob 배열
 * @returns {Array} 변환된 JobPosting 형태의 배열
 */
const convertCrawledJobsToLegacy = (crawledJobs) => {
  if (!Array.isArray(crawledJobs)) return [];

  return crawledJobs
    .map(job => convertCrawledJobToLegacy(job))
    .filter(job => job !== null); // null 값 제거
};

/**
 * Convert legacy filters to crawled job query format
 * @param {Object} legacyFilters - 기존 UI 필터 형태
 * @returns {Object} CrawledJob 쿼리용 필터
 */
const convertLegacyFiltersToCrawled = (legacyFilters) => {
  const crawledFilters = {};

  if (legacyFilters.jobCategory) {
    crawledFilters.job_category = legacyFilters.jobCategory;
  }

  if (legacyFilters.experienceLevel) {
    // 역매핑
    const experienceMapping = {
      '신입': '신입',
      '1-3년차': '경력',
      '경력무관': '경력무관'
    };
    crawledFilters.experience_level = experienceMapping[legacyFilters.experienceLevel];
  }

  if (legacyFilters.region) {
    crawledFilters.location = legacyFilters.region;
  }

  if (legacyFilters.companySize) {
    // 회사 규모는 크롤링 데이터에 직접 없으므로 제외
    // 필요시 company_name 기반 필터링 로직 추가
  }

  return crawledFilters;
};

/**
 * Create pagination response in legacy format
 * @param {Array} jobs - 변환된 job 배열
 * @param {Object} pagination - 페이징 정보
 * @returns {Object} 기존 API 응답 형태
 */
const createLegacyPaginationResponse = (jobs, pagination) => {
  return {
    success: true,
    data: {
      jobs,
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalJobs: pagination.totalItems,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev,
    }
  };
};

/**
 * Convert crawled job statistics to legacy format
 * @param {Object} crawledStats - 크롤링 통계 데이터
 * @returns {Object} 기존 통계 형태
 */
const convertStatsToLegacy = (crawledStats) => {
  const { overview, byCategory, bySource, qualityDistribution } = crawledStats;

  return {
    totalJobs: overview?.total_jobs || 0,
    avgQuality: overview?.avg_quality || 0,
    recentJobs: overview?.recent_jobs || 0,
    categories: byCategory || [],
    sources: bySource || [],
    quality: qualityDistribution || [],
    lastUpdated: crawledStats.lastUpdated || new Date().toISOString()
  };
};

module.exports = {
  convertCrawledJobToLegacy,
  convertCrawledJobsToLegacy,
  convertLegacyFiltersToCrawled,
  createLegacyPaginationResponse,
  convertStatsToLegacy,
  extractSalaryMin,
  extractSalaryMax
};