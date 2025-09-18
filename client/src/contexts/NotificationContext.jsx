import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  Slide,
  Grow,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Circle as CircleIcon,
  Delete as DeleteIcon,
  MarkAsUnread as MarkAsUnreadIcon,
} from '@mui/icons-material';

// 알림 컨텍스트 생성
const NotificationContext = createContext();

// 알림 타입별 설정
const NOTIFICATION_CONFIG = {
  success: {
    icon: SuccessIcon,
    color: 'success',
    duration: 4000,
  },
  error: {
    icon: ErrorIcon,
    color: 'error',
    duration: 6000,
  },
  warning: {
    icon: WarningIcon,
    color: 'warning',
    duration: 5000,
  },
  info: {
    icon: InfoIcon,
    color: 'info',
    duration: 4000,
  },
};

// 슬라이드 트랜지션
function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

// 그로우 트랜지션
function GrowTransition(props) {
  return <Grow {...props} />;
}

// 알림 프로바이더 컴포넌트
export const NotificationProvider = ({ children }) => {
  const [snackbars, setSnackbars] = useState([]);
  const [notifications, setNotifications] = useState([
    // Mock 초기 알림들
    {
      id: 1,
      type: 'success',
      title: '분석 완료',
      message: 'React 개발자 직무 분석이 완료되었습니다.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      action: { label: '결과 보기', path: '/analysis/1' }
    },
    {
      id: 2,
      type: 'info',
      title: '새로운 채용공고',
      message: '네이버에서 프론트엔드 개발자를 모집하고 있습니다.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      action: { label: '공고 보기', path: '/jobs/1' }
    },
    {
      id: 3,
      type: 'warning',
      title: '학습 진도 알림',
      message: 'React 학습 경로의 다음 단계를 시작하세요.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      action: { label: '학습 계속하기', path: '/learning-paths?path=1' }
    },
  ]);
  const [anchorEl, setAnchorEl] = useState(null);

  // 스낵바 알림 표시
  const showSnackbar = useCallback((type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.info;

    const snackbar = {
      id,
      type,
      message,
      severity: type,
      duration: options.duration || config.duration,
      action: options.action,
      autoHide: options.autoHide !== false,
      ...options,
    };

    setSnackbars(prev => [...prev, snackbar]);

    // 자동 숨김
    if (snackbar.autoHide) {
      setTimeout(() => {
        hideSnackbar(id);
      }, snackbar.duration);
    }

    return id;
  }, []);

  // 스낵바 숨김
  const hideSnackbar = useCallback((id) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
  }, []);

  // 모든 스낵바 숨김
  const hideAllSnackbars = useCallback(() => {
    setSnackbars([]);
  }, []);

  // 영구 알림 추가
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // 스낵바로도 표시
    if (notification.showSnackbar !== false) {
      showSnackbar(notification.type, notification.message, {
        action: notification.action,
      });
    }

    return newNotification.id;
  }, [showSnackbar]);

  // 알림 읽음 처리
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // 알림 삭제
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // 모든 알림 삭제
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 편의 메서드들
  const showSuccess = useCallback((message, options) => showSnackbar('success', message, options), [showSnackbar]);
  const showError = useCallback((message, options) => showSnackbar('error', message, options), [showSnackbar]);
  const showWarning = useCallback((message, options) => showSnackbar('warning', message, options), [showSnackbar]);
  const showInfo = useCallback((message, options) => showSnackbar('info', message, options), [showSnackbar]);

  // 컨텍스트 값
  const contextValue = {
    // 스낵바 관련
    showSnackbar,
    hideSnackbar,
    hideAllSnackbars,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    snackbars,

    // 영구 알림 관련
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    unreadCount: notifications.filter(n => !n.read).length,
  };

  // 알림 메뉴 열기/닫기
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  // 알림 아이콘 렌더링
  const getNotificationIcon = (type) => {
    const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.info;
    const IconComponent = config.icon;
    return <IconComponent fontSize="small" />;
  };

  // 시간 포맷팅
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* 알림 벨 아이콘 (글로벌 헤더에서 사용) */}
      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <IconButton
          onClick={handleNotificationClick}
          color="inherit"
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': { bgcolor: 'grey.100' }
          }}
        >
          <Badge badgeContent={contextValue.unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* 알림 드롭다운 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              width: 350,
              maxHeight: 400,
              overflow: 'auto',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* 헤더 */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                알림 ({contextValue.unreadCount})
              </Typography>
              <Button
                size="small"
                onClick={markAllAsRead}
                disabled={contextValue.unreadCount === 0}
              >
                모두 읽음
              </Button>
            </Box>
          </Box>

          {/* 알림 목록 */}
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                새로운 알림이 없습니다.
              </Typography>
            </MenuItem>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.action?.path) {
                    // 실제 구현에서는 navigate 사용
                    console.log('Navigate to:', notification.action.path);
                  }
                  handleNotificationClose();
                }}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  whiteSpace: 'normal',
                  py: 1.5,
                  borderLeft: notification.read ? 'none' : '4px solid',
                  borderColor: NOTIFICATION_CONFIG[notification.type]?.color + '.main',
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1 }}>
                  <Box sx={{ color: NOTIFICATION_CONFIG[notification.type]?.color + '.main' }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(notification.timestamp)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    sx={{ opacity: 0.7 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </MenuItem>
            ))
          )}

          {/* 푸터 */}
          {notifications.length > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button
                  size="small"
                  color="error"
                  onClick={clearAllNotifications}
                  startIcon={<DeleteIcon />}
                >
                  모든 알림 삭제
                </Button>
              </Box>
            </>
          )}
        </Menu>
      </Box>

      {/* 스낵바들 렌더링 */}
      {snackbars.map((snackbar) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          TransitionComponent={snackbar.transition === 'grow' ? GrowTransition : SlideTransition}
          anchorOrigin={{
            vertical: snackbar.vertical || 'bottom',
            horizontal: snackbar.horizontal || 'right',
          }}
          sx={{
            '& .MuiSnackbarContent-root': {
              minWidth: 300,
            }
          }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => hideSnackbar(snackbar.id)}
            action={
              snackbar.action ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    if (snackbar.action.onClick) {
                      snackbar.action.onClick();
                    }
                    hideSnackbar(snackbar.id);
                  }}
                >
                  {snackbar.action.label}
                </Button>
              ) : undefined
            }
            sx={{
              '& .MuiAlert-message': {
                fontSize: '0.875rem',
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};

// 커스텀 훅
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications는 NotificationProvider 내부에서 사용해야 합니다.');
  }
  return context;
};

export default NotificationContext;