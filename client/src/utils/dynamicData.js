/**
 * Dynamic Data Utilities
 * 크롤링 데이터를 기반으로 동적으로 필터 옵션을 생성
 */

import { SkillMapAPI } from '../services/api';

// 기본 필터 옵션 (크롤링 데이터와 독립적)
export const defaultFilterOptions = {
  experienceLevel: [
    { value: '', label: '전체' },
    { value: '신입', label: '신입' },
    { value: '1-3년차', label: '1-3년차' },
    { value: '경력무관', label: '경력무관' },
  ],
  companySize: [
    { value: '', label: '전체' },
    { value: '스타트업', label: '스타트업' },
    { value: '중견기업', label: '중견기업' },
    { value: '대기업', label: '대기업' },
  ],
  region: [
    { value: '', label: '전체' },
    { value: '서울', label: '서울' },
    { value: '경기', label: '경기' },
    { value: '부산', label: '부산' },
    { value: '대구', label: '대구' },
    { value: '인천', label: '인천' },
    { value: '광주', label: '광주' },
    { value: '대전', label: '대전' },
    { value: '울산', label: '울산' },
    { value: '세종', label: '세종' },
    { value: '기타', label: '기타' },
  ]
};

// 기본 직업 카테고리
export const defaultJobCategories = {
  'IT/개발': {
    subcategories: [
      '프론트엔드',
      '백엔드',
      '풀스택',
      'DevOps',
      '모바일',
      'AI/ML',
      '보안',
      '게임개발',
      '데이터분석',
      'QA/테스터'
    ]
  },
  '마케팅': {
    subcategories: [
      '디지털마케팅',
      '퍼포먼스마케팅',
      '콘텐츠마케팅',
      '브랜드마케팅',
      '그로스해킹'
    ]
  },
  '디자인': {
    subcategories: [
      'UI/UX',
      '웹디자인',
      '그래픽디자인',
      '브랜딩',
      '일러스트'
    ]
  }
};

/**
 * 크롤링 데이터를 기반으로 동적 필터 옵션 생성
 */
export const getDynamicFilterOptions = async () => {
  try {
    // 크롤링 통계 데이터 조회
    const response = await fetch('http://localhost:3000/api/crawled/jobs/stats');
    const data = await response.json();

    if (data.success && data.data) {
      const stats = data.data;

      // 카테고리 추출
      const categories = stats.byCategory || [];
      const categoryOptions = [
        { value: '', label: '전체' },
        ...categories.map(cat => ({
          value: cat._id,
          label: cat._id
        }))
      ];

      // 소스 사이트 추출
      const sources = stats.bySource || [];
      const sourceOptions = [
        { value: '', label: '전체' },
        ...sources.map(source => ({
          value: source._id,
          label: source._id
        }))
      ];

      return {
        ...defaultFilterOptions,
        jobCategory: categoryOptions,
        source: sourceOptions
      };
    }

    // 에러 시 기본값 반환
    return {
      ...defaultFilterOptions,
      jobCategory: [
        { value: '', label: '전체' },
        { value: 'IT/개발', label: 'IT/개발' },
        { value: '마케팅', label: '마케팅' },
        { value: '디자인', label: '디자인' }
      ]
    };

  } catch (error) {
    console.error('Error fetching dynamic filter options:', error);
    return {
      ...defaultFilterOptions,
      jobCategory: [
        { value: '', label: '전체' },
        { value: 'IT/개발', label: 'IT/개발' }
      ]
    };
  }
};

/**
 * 크롤링 데이터를 기반으로 직업 카테고리 조회
 */
export const getDynamicJobCategories = async () => {
  try {
    const jobs = await SkillMapAPI.getJobs({ limit: 100 });

    // 실제 크롤링된 직업 카테고리들 추출
    const categories = {};

    jobs.forEach(job => {
      if (job.jobCategory) {
        if (!categories[job.jobCategory]) {
          categories[job.jobCategory] = {
            subcategories: new Set()
          };
        }

        // 서브카테고리는 키워드나 직책명에서 추출
        if (job.keywords) {
          job.keywords.forEach(keyword => {
            categories[job.jobCategory].subcategories.add(keyword);
          });
        }
      }
    });

    // Set을 Array로 변환
    Object.keys(categories).forEach(category => {
      categories[category].subcategories = Array.from(categories[category].subcategories).slice(0, 10);
    });

    return Object.keys(categories).length > 0 ? categories : defaultJobCategories;

  } catch (error) {
    console.error('Error fetching dynamic job categories:', error);
    return defaultJobCategories;
  }
};

/**
 * 인기 키워드 조회 (검색 제안용)
 */
export const getPopularKeywords = async () => {
  try {
    const trendingSkills = await SkillMapAPI.getTrendingSkills();
    return trendingSkills.slice(0, 10).map(skill => skill.name);
  } catch (error) {
    console.error('Error fetching popular keywords:', error);
    return ['React', 'JavaScript', 'Python', 'Java', 'AWS', 'Docker'];
  }
};

export default {
  getDynamicFilterOptions,
  getDynamicJobCategories,
  getPopularKeywords,
  defaultFilterOptions,
  defaultJobCategories
};