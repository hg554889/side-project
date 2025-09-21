const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/chatModel.js');
const Conversation = require('../models/conversationModel.js');
require('dotenv').config();

// .env 파일에서 GEMINI_API_KEY 값 가져오기.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generateSessionId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const handleChat = async (req, res) => {
  console.log('📞 Chat request received:', req.body);

  try {
    const { message, history, conversationId } = req.body;

    if (!message) {
      console.log('❌ No message provided');
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'API key가 설정되지 않았습니다.' });
    }

    console.log('✅ Processing message:', message.substring(0, 50));

    let conversation;
    let sessionId = conversationId;

    // 기존 대화가 있으면 찾고, 없으면 새로 생성
    if (conversationId) {
      conversation = await Conversation.findOne({ sessionId: conversationId });
    }

    if (!conversation) {
      sessionId = generateSessionId();
      conversation = new Conversation({
        sessionId: sessionId,
        title: message.length > 50 ? message.substring(0, 50) + '...' : message,
        messages: []
      });
    }

    // 사용자 메시지 저장
    conversation.messages.push({
      sender: 'user',
      content: message,
      timestamp: new Date()
    });

    // Gemini AI 모델 초기화
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // 대화 히스토리 구성 (Gemini 형식에 맞게)
    const chatHistory = conversation.messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    console.log('🤖 Sending to Gemini API...');

    let text;
    if (chatHistory.length === 1) {
      // 첫 번째 메시지인 경우 직접 generateContent 사용
      const result = await model.generateContent(message);
      const response = await result.response;
      text = response.text();
    } else {
      // 대화가 있는 경우 startChat 사용
      const chat = model.startChat({
        history: chatHistory.slice(0, -1) // 현재 메시지 제외한 히스토리
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      text = response.text();
    }

    console.log('📥 Received from Gemini:', text.substring(0, 100));

    // 봇 응답 저장
    conversation.messages.push({
      sender: 'bot',
      content: text,
      timestamp: new Date()
    });

    await conversation.save();
    console.log('💾 Conversation saved with ID:', sessionId);

    // 기존 Chat 모델에도 저장 (호환성을 위해)
    if (req.userId) { // userId가 있는 경우에만
      const newChat = new Chat({
        userId: req.userId,
        userMessage: message,
        botResponse: text,
      });
      await newChat.save();
    }

    res.status(200).json({
      reply: text,
      conversationId: sessionId
    });

  } catch (error) {
    console.error('❌ Error in handleChat:', {
      error: error.message,
      stack: error.stack,
      conversationId: req.body.conversationId
    });

    res.status(500).json({
      error: '챗봇 응답을 가져오는 데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 대화 조회
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({ sessionId: conversationId });

    if (!conversation) {
      return res.status(404).json({ success: false, error: '대화를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      success: true,
      conversation: conversation
    });
  } catch (error) {
    console.error('대화 조회 중 오류 발생:', error);
    res.status(500).json({ success: false, error: '대화 조회에 실패했습니다.' });
  }
};

// 사용자의 모든 대화 목록 조회
const getConversations = async (req, res) => {
  try {
    const { userId } = req.query;

    const query = userId ? { userId } : { isActive: true };
    const conversations = await Conversation.find(query)
      .select('sessionId title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(50);

    const conversationList = conversations.map(conv => ({
      sessionId: conv.sessionId,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length,
      lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null
    }));

    res.status(200).json({
      success: true,
      conversations: conversationList
    });
  } catch (error) {
    console.error('대화 목록 조회 중 오류 발생:', error);
    res.status(500).json({ success: false, error: '대화 목록 조회에 실패했습니다.' });
  }
};

// 대화 삭제
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const result = await Conversation.findOneAndDelete({ sessionId: conversationId });

    if (!result) {
      return res.status(404).json({ success: false, error: '대화를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      success: true,
      message: '대화가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('대화 삭제 중 오류 발생:', error);
    res.status(500).json({ success: false, error: '대화 삭제에 실패했습니다.' });
  }
};

module.exports = {
  handleChat,
  getConversation,
  getConversations,
  deleteConversation
};