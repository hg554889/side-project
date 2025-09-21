import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  FolderOpen as LoadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { sendMessageToBot, getConversation, getConversations } from '../services/chatService';

const ChatPage = () => {
  const [messages, setMessages] = useState([]); // { id, sender: 'user' | 'bot', text: string, timestamp, status } 형태의 객체 배열
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingDots, setTypingDots] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      let dots = '';
      typingIntervalRef.current = setInterval(() => {
        dots = dots.length >= 3 ? '' : dots + '.';
        setTypingDots(dots);
      }, 500);
    } else {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        setTypingDots('');
      }
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [isLoading]);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageId = generateMessageId();
    const userMessage = {
      id: messageId,
      sender: 'user',
      text: input,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Update message status to sent
    setMessages((prev) => prev.map(msg =>
      msg.id === messageId ? { ...msg, status: 'sent' } : msg
    ));

    try {
      // Gemini API는 이전 대화 내용을 참고하여 답변을 생성할 수 있습니다.
      // `history`를 백엔드로 전달하여 대화의 연속성을 유지할 수 있습니다.
      const history = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: msg.text,
      }));

      const botReply = await sendMessageToBot(userMessage.text, history, conversationId);
      const botMessage = {
        id: generateMessageId(),
        sender: 'bot',
        text: botReply.reply,
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages((prev) => [...prev, botMessage]);

      // Update conversation ID if returned
      if (botReply.conversationId) {
        setConversationId(botReply.conversationId);
      }
    } catch (error) {
      const errorMessage = {
        id: generateMessageId(),
        sender: 'bot',
        text: '죄송합니다. 오류가 발생했습니다.',
        timestamp: new Date(),
        status: 'error'
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Update user message status to error
      setMessages((prev) => prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <ScheduleIcon sx={{ fontSize: 12, color: 'grey.400' }} />;
      case 'sent':
        return <CheckIcon sx={{ fontSize: 12, color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 12, color: 'error.main' }} />;
      default:
        return null;
    }
  };

  const saveConversation = async () => {
    try {
      if (!conversationId) {
        alert('저장할 대화가 없습니다.');
        return;
      }
      // 대화는 이미 서버에 자동 저장됨
      alert('대화가 저장되었습니다!');
    } catch (error) {
      alert('대화 저장에 실패했습니다.');
    }
  };

  const loadConversationList = async () => {
    try {
      const response = await getConversations();
      if (response.success) {
        setConversations(response.conversations);
        setLoadDialogOpen(true);
      } else {
        alert('대화 목록을 불러올 수 없습니다.');
      }
    } catch (error) {
      alert('대화 목록 불러오기에 실패했습니다.');
    }
  };

  const loadSpecificConversation = async (sessionId) => {
    try {
      const response = await getConversation(sessionId);
      if (response.success) {
        const loadedMessages = response.conversation.messages.map(msg => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.content,
          timestamp: new Date(msg.timestamp),
          status: 'sent'
        }));

        setMessages(loadedMessages);
        setConversationId(sessionId);
        setLoadDialogOpen(false);
        alert('대화를 불러왔습니다!');
      } else {
        alert('대화를 찾을 수 없습니다.');
      }
    } catch (error) {
      alert('대화 불러오기에 실패했습니다.');
    }
  };

  const clearConversation = () => {
    if (window.confirm('대화를 모두 삭제하시겠습니까?')) {
      setMessages([]);
      setConversationId(null);
    }
  };

  const startNewConversation = () => {
    if (messages.length > 0) {
      if (window.confirm('새로운 대화를 시작하시겠습니까? 현재 대화 내용이 사라집니다.')) {
        setMessages([]);
        setConversationId(null);
      }
    } else {
      setMessages([]);
      setConversationId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: '900px', margin: 'auto', p: 3, minHeight: 'calc(100vh - 100px)' }}>
        {/* Page Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            AI 챗봇
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            궁금한 것이 있으면 언제든지 물어보세요!
          </Typography>
          {conversationId && (
            <Chip
              label={`대화 ID: ${conversationId.slice(-8)}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {/* Chat Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Tooltip title="새로운 대화 시작">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={startNewConversation}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                py: 1,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main',
                }
              }}
            >
              새 대화
            </Button>
          </Tooltip>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="대화 저장">
              <IconButton
                onClick={saveConversation}
                disabled={!conversationId}
                sx={{
                  bgcolor: conversationId ? 'primary.light' : 'grey.100',
                  color: conversationId ? 'white' : 'grey.400',
                  '&:hover': {
                    bgcolor: conversationId ? 'primary.main' : 'grey.200',
                  }
                }}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="대화 불러오기">
              <IconButton
                onClick={loadConversationList}
                sx={{
                  bgcolor: 'secondary.light',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.main',
                  }
                }}
              >
                <LoadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="더 보기">
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{
                  bgcolor: 'grey.200',
                  '&:hover': {
                    bgcolor: 'grey.300',
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={() => { clearConversation(); setMenuAnchor(null); }}>
                대화 초기화
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        <Paper
          elevation={2}
          sx={{
            height: '65vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
            {messages.length === 0 && !isLoading && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <BotIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  안녕하세요! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  무엇이든 궁금한 것이 있으면 아래에 메시지를 입력해 주세요.
                </Typography>
              </Box>
            )}

            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  mb: 3,
                  display: 'flex',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main',
                    fontSize: '14px'
                  }}
                >
                  {msg.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                </Avatar>

                {/* Message Content */}
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Message Bubble */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: '18px',
                      bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderTopLeftRadius: msg.sender === 'user' ? '18px' : '4px',
                      borderTopRightRadius: msg.sender === 'user' ? '4px' : '18px',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                      {msg.text}
                    </Typography>
                  </Paper>

                  {/* Message Info */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 0.5,
                      px: 1,
                      opacity: 0.7
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(msg.timestamp)}
                    </Typography>
                    {msg.sender === 'user' && getStatusIcon(msg.status)}
                  </Box>
                </Box>
              </Box>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'secondary.main',
                    fontSize: '14px'
                  }}
                >
                  <BotIcon />
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    borderRadius: '18px',
                    borderTopLeftRadius: '4px',
                    bgcolor: 'grey.100',
                    minWidth: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    입력 중{typingDots}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                multiline
                maxRows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="large"
                sx={{
                  minWidth: '100px',
                  width: '100px',
                  height: '56px',
                  borderRadius: 2,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {isLoading ? '전송 중' : '전송'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Load Conversation Dialog */}
        <Dialog
          open={loadDialogOpen}
          onClose={() => setLoadDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>대화 목록</DialogTitle>
          <DialogContent>
            {conversations.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                저장된 대화가 없습니다.
              </Typography>
            ) : (
              <List>
                {conversations.map((conv) => (
                  <ListItem
                    key={conv.sessionId}
                    button
                    onClick={() => loadSpecificConversation(conv.sessionId)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={conv.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            메시지 {conv.messageCount}개 •{' '}
                            {new Date(conv.updatedAt).toLocaleDateString('ko-KR')}
                          </Typography>
                          {conv.lastMessage && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {conv.lastMessage.sender === 'user' ? '나: ' : '봇: '}
                              {conv.lastMessage.content}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={conv.sessionId.slice(-8)}
                        size="small"
                        variant="outlined"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLoadDialogOpen(false)}>닫기</Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default ChatPage;
