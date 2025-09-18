/**
 * API Service Layer
 * 현재는 Mock 데이터를 사용하지만, 나중에 실제 API 호출로 쉽게 교체할 수 있도록 설계
 */

// Mock 데이터 임포트 (나중에 실제 API로 교체)
import {
  mockCompanies,
  mockAnalysisResults,
  mockTrendingSkills,
  mockAnalysisHistory,
  mockSalaryInsights,
  mockMarketOverview,
  mockLearningPaths
} from '../utils/mockData';

// API 기본 설정
const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3000/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// 실제 API 호출 함수 (현재는 비활성화)
const apiCall = async (endpoint, options = {}) => {
  // TODO: 실제 API 연동 시 활성화
  // const url = `${API_CONFIG.baseURL}${endpoint}`;
  // const response = await fetch(url, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     ...options.headers,
  //   },
  //   ...options,
  // });
  //
  // if (!response.ok) {
  //   throw new Error(`API Error: ${response.status}`);
  // }
  //
  // return response.json();

  // 현재는 Mock 데이터 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: null });
    }, Math.random() * 1000 + 500); // 0.5-1.5초 랜덤 지연
  });
};

// 에러 처리 헬퍼
const handleApiError = (error, context) => {
  console.error(`API Error in ${context}:`, error);
  throw new Error(`${context} 중 오류가 발생했습니다: ${error.message}`);
};

/**
 * SkillMap API 서비스 클래스
 */
export class SkillMapAPI {

  // ==== Jobs API ====

  /**
   * 채용공고 목록 조회
   * @param {Object} params - 검색 파라미터
   * @returns {Promise<Array>} 채용공고 목록
   */
  static async getJobs(params = {}) {
    try {
      // TODO: 실제 API 호출
      // await apiCall('/jobs', { method: 'GET' });

      // Mock 데이터 반환 (필터링 적용)
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredJobs = [...mockCompanies];

      // 검색어 필터링
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
          job.name.toLowerCase().includes(searchLower) ||
          job.position.toLowerCase().includes(searchLower) ||
          job.skills.some(skill => skill.toLowerCase().includes(searchLower))
        );
      }

      // 기타 필터링
      if (params.experience) {
        filteredJobs = filteredJobs.filter(job => job.experienceLevel === params.experience);
      }

      if (params.region) {
        filteredJobs = filteredJobs.filter(job => job.region === params.region);
      }

      if (params.companySize) {
        filteredJobs = filteredJobs.filter(job => job.companySize === params.companySize);
      }

      return filteredJobs;
    } catch (error) {
      handleApiError(error, '채용공고 조회');
    }
  }

  /**
   * 특정 채용공고 상세 조회
   * @param {string} id - 채용공고 ID
   * @returns {Promise<Object>} 채용공고 상세 정보
   */
  static async getJobDetail(id) {
    try {
      // TODO: 실제 API 호출
      // return await apiCall(`/jobs/${id}`);

      await new Promise(resolve => setTimeout(resolve, 300));
      const job = mockCompanies.find(job => job.id === parseInt(id));

      if (!job) {
        throw new Error('채용공고를 찾을 수 없습니다.');
      }

      return job;
    } catch (error) {
      handleApiError(error, '채용공고 상세 조회');
    }
  }

  /**
   * 인기 스킬 조회
   * @returns {Promise<Array>} 인기 스킬 목록
   */
  static async getTrendingSkills() {
    try {
      // TODO: 실제 API 호출
      // return await apiCall('/jobs/trending/skills');

      await new Promise(resolve => setTimeout(resolve, 400));
      return mockTrendingSkills;
    } catch (error) {
      handleApiError(error, '인기 스킬 조회');
    }
  }

  // ==== Analysis API ====

  /**
   * 분석 시작
   * @param {Object} params - 분석 파라미터
   * @returns {Promise<Object>} 분석 결과
   */
  static async startAnalysis(params) {
    try {
      // TODO: 실제 API 호출
      // return await apiCall('/analysis/start', {
      //   method: 'POST',
      //   body: JSON.stringify(params)
      // });

      await new Promise(resolve => setTimeout(resolve, 2000)); // 분석 시뮬레이션

      const analysisId = Date.now().toString();
      const result = {
        id: analysisId,
        ...mockAnalysisResults[0],
        params,
        createdAt: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      handleApiError(error, '분석 시작');
    }
  }

  /**
   * 분석 결과 조회
   * @param {string} id - 분석 ID
   * @returns {Promise<Object>} 분석 결과
   */
  static async getAnalysisResult(id) {
    try {
      // TODO: 실제 API 호출
      // return await apiCall(`/analysis/${id}`);

      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock 데이터에서 해당 ID의 분석 결과 찾기 (없으면 첫 번째 결과 반환)
      const result = mockAnalysisResults.find(result => result.id === id)
        || mockAnalysisResults[0];

      return { ...result, id };
    } catch (error) {
      handleApiError(error, '분석 결과 조회');
    }
  }

  /**
   * 분석 히스토리 조회
   * @returns {Promise<Array>} 분석 히스토리
   */
  static async getAnalysisHistory() {
    try {
      // TODO: 실제 API 호출
      // return await apiCall('/analysis/history');

      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAnalysisHistory;
    } catch (error) {
      handleApiError(error, '분석 히스토리 조회');
    }
  }

  /**
   * 연봉 인사이트 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise<Object>} 연봉 인사이트
   */
  static async getSalaryInsights(params = {}) {
    try {
      // TODO: 실제 API 호출
      // return await apiCall('/analysis/salary/insights', { method: 'GET' });

      await new Promise(resolve => setTimeout(resolve, 500));
      return mockSalaryInsights;
    } catch (error) {
      handleApiError(error, '연봉 인사이트 조회');
    }
  }

  /**
   * 시장 동향 조회
   * @returns {Promise<Object>} 시장 동향
   */
  static async getMarketOverview() {
    try {
      // TODO: 실제 API 호출
      // return await apiCall('/analysis/market/overview');

      await new Promise(resolve => setTimeout(resolve, 400));
      return mockMarketOverview;
    } catch (error) {
      handleApiError(error, '시장 동향 조회');
    }
  }

  /**
   * 학습 경로 추천
   * @param {Object} params - 사용자 프로필
   * @returns {Promise<Array>} 학습 경로 목록
   */
  static async getLearningPaths(params = {}) {
    try {
      // TODO: 실제 API 호출
      // return await apiCall('/analysis/learning-path', { method: 'GET' });

      await new Promise(resolve => setTimeout(resolve, 600));
      return mockLearningPaths;
    } catch (error) {
      handleApiError(error, '학습 경로 조회');
    }
  }

  /**
   * 분야 비교 분석
   * @param {Object} params - 비교 파라미터
   * @returns {Promise<Object>} 비교 분석 결과
   */
  static async compareFields(params) {
    try {
      // TODO: 실제 API 호출
      // return await apiCall('/analysis/compare', {
      //   method: 'POST',
      //   body: JSON.stringify(params)
      // });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock 비교 결과 생성
      const comparisonResult = {
        id: Date.now().toString(),
        comparedFields: params.fields,
        skillGaps: [
          { skill: 'React', field1: 85, field2: 45 },
          { skill: 'Python', field1: 60, field2: 90 },
          { skill: 'AWS', field1: 70, field2: 80 },
        ],
        salaryComparison: {
          field1: { min: 4000, max: 8000, avg: 6000 },
          field2: { min: 3500, max: 7500, avg: 5500 },
        },
        createdAt: new Date().toISOString(),
      };

      return comparisonResult;
    } catch (error) {
      handleApiError(error, '분야 비교 분석');
    }
  }

  // ==== Admin API (나중에 관리자 페이지용) ====

  /**
   * 시스템 상태 조회
   * @returns {Promise<Object>} 시스템 상태
   */
  static async getSystemStatus() {
    try {
      // TODO: 실제 API 호출
      // return await apiCall('/admin/health');

      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        status: 'healthy',
        database: 'connected',
        lastCrawl: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        totalJobs: mockCompanies.length,
        activeAnalysis: 3,
      };
    } catch (error) {
      handleApiError(error, '시스템 상태 조회');
    }
  }
}

export default SkillMapAPI;