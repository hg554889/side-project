const express = require('express');
const router = express.Router();

console.log('🔧 Loading chatRoutes...');

const {
  handleChat,
  getConversation,
  getConversations,
  deleteConversation
} = require('../services/chatService.js');

console.log('✅ chatService loaded:', { handleChat: !!handleChat });

// 인증 관련 미들웨어가 있다면 추가

// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Test route hit');
  res.json({ message: 'Chat route is working!' });
});

// POST /api/chat - 채팅 메시지 전송
router.post('/', (req, res, next) => {
  console.log('🎯 POST /api/chat route hit');
  handleChat(req, res, next);
});

// GET /api/chat/conversations - 모든 대화 목록 조회
router.get('/conversations', getConversations);

// GET /api/chat/conversation/:conversationId - 특정 대화 조회
router.get('/conversation/:conversationId', getConversation);

// DELETE /api/chat/conversation/:conversationId - 특정 대화 삭제
router.delete('/conversation/:conversationId', deleteConversation);

module.exports = router;
