import axios from 'axios';

// 백엔드 API의 기본 URL 설정 (vite.config.js 프록시 설정을 활용할 수도 있습니다)
const API_URL = '/api/chat';

/**
 * 챗봇에게 메시지를 보내고 응답을 받습니다.
 * @param {string} message - 사용자가 입력한 메시지
 * @param {Array} history - 이전 대화 기록 (선택 사항)
 * @param {string} conversationId - 대화 세션 ID (선택 사항)
 * @returns {Promise<Object>} 챗봇의 응답과 대화 ID
 */
export const sendMessageToBot = async (message, history, conversationId = null) => {
  try {
    const response = await axios.post(API_URL, {
      message,
      history,
      conversationId
    });
    return {
      reply: response.data.reply,
      conversationId: response.data.conversationId
    };
  } catch (error) {
    console.error('메시지 전송 중 오류 발생:', error);
    throw new Error('챗봇 응답을 가져오는 데 실패했습니다.');
  }
};

/**
 * 특정 대화를 조회합니다.
 * @param {string} conversationId - 대화 세션 ID
 * @returns {Promise<Object>} 대화 데이터
 */
export const getConversation = async (conversationId) => {
  try {
    const response = await axios.get(`${API_URL}/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('대화 조회 중 오류 발생:', error);
    throw new Error('대화를 불러오는 데 실패했습니다.');
  }
};

/**
 * 모든 대화 목록을 조회합니다.
 * @param {string} userId - 사용자 ID (선택 사항)
 * @returns {Promise<Object>} 대화 목록
 */
export const getConversations = async (userId = null) => {
  try {
    const params = userId ? { userId } : {};
    const response = await axios.get(`${API_URL}/conversations`, { params });
    return response.data;
  } catch (error) {
    console.error('대화 목록 조회 중 오류 발생:', error);
    throw new Error('대화 목록을 불러오는 데 실패했습니다.');
  }
};

/**
 * 특정 대화를 삭제합니다.
 * @param {string} conversationId - 대화 세션 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteConversation = async (conversationId) => {
  try {
    const response = await axios.delete(`${API_URL}/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('대화 삭제 중 오류 발생:', error);
    throw new Error('대화 삭제에 실패했습니다.');
  }
};
