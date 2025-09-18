import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Link,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Auth 컨텍스트 생성
const AuthContext = createContext();

// Mock 사용자 데이터
const MOCK_USERS = [
  {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    name: '김개발',
    avatar: '',
    role: 'user',
    preferences: {
      jobCategory: 'IT/개발',
      experienceLevel: '1-3년차',
      region: '서울',
      skills: ['React', 'JavaScript', 'TypeScript'],
    },
    savedJobs: [1, 2, 3],
    analysisHistory: ['analysis_001', 'analysis_002'],
    learningPaths: [1],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    email: 'admin@skillmap.com',
    password: 'admin123',
    name: '관리자',
    avatar: '',
    role: 'admin',
    preferences: {},
    savedJobs: [],
    analysisHistory: [],
    learningPaths: [],
    createdAt: new Date('2024-01-01'),
  }
];

// Auth Provider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authDialog, setAuthDialog] = useState({ open: false, mode: 'login' });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    agreeTerms: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기화 - localStorage에서 사용자 정보 복원
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('skillmap_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('사용자 정보 복원 실패:', error);
        localStorage.removeItem('skillmap_user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 폼 데이터 업데이트
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [formErrors]);

  // 폼 검증
  const validateForm = useCallback((mode) => {
    const errors = {};

    // 이메일 검증
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    // 회원가입 추가 검증
    if (mode === 'register') {
      if (!formData.name) {
        errors.name = '이름을 입력해주세요.';
      } else if (formData.name.length < 2) {
        errors.name = '이름은 2자 이상이어야 합니다.';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }

      if (!formData.agreeTerms) {
        errors.agreeTerms = '이용약관에 동의해주세요.';
      }

      // 이메일 중복 체크
      if (MOCK_USERS.find(u => u.email === formData.email)) {
        errors.email = '이미 가입된 이메일입니다.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // 로그인
  const login = useCallback(async (email, password) => {
    setIsSubmitting(true);
    try {
      // Mock 로그인 처리
      await new Promise(resolve => setTimeout(resolve, 1000));

      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        setFormErrors({ submit: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        return false;
      }

      // 비밀번호 제거 (보안)
      const { password: _, ...userData } = foundUser;

      setUser(userData);
      localStorage.setItem('skillmap_user', JSON.stringify(userData));

      setAuthDialog({ open: false, mode: 'login' });
      resetForm();

      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      setFormErrors({ submit: '로그인 중 오류가 발생했습니다.' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // 회원가입
  const register = useCallback(async (userData) => {
    setIsSubmitting(true);
    try {
      // Mock 회원가입 처리
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        avatar: '',
        role: 'user',
        preferences: {},
        savedJobs: [],
        analysisHistory: [],
        learningPaths: [],
        createdAt: new Date(),
      };

      // Mock DB에 추가 (실제로는 서버에서 처리)
      MOCK_USERS.push({ ...newUser, password: userData.password });

      setUser(newUser);
      localStorage.setItem('skillmap_user', JSON.stringify(newUser));

      setAuthDialog({ open: false, mode: 'register' });
      resetForm();

      return true;
    } catch (error) {
      console.error('회원가입 실패:', error);
      setFormErrors({ submit: '회원가입 중 오류가 발생했습니다.' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('skillmap_user');
  }, []);

  // 소셜 로그인 (Mock)
  const socialLogin = useCallback(async (provider) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock 소셜 로그인 사용자
      const socialUser = {
        id: Date.now(),
        email: `${provider}@example.com`,
        name: `${provider} 사용자`,
        avatar: '',
        role: 'user',
        preferences: {},
        savedJobs: [],
        analysisHistory: [],
        learningPaths: [],
        createdAt: new Date(),
      };

      setUser(socialUser);
      localStorage.setItem('skillmap_user', JSON.stringify(socialUser));

      setAuthDialog({ open: false, mode: 'login' });
      return true;
    } catch (error) {
      console.error('소셜 로그인 실패:', error);
      setFormErrors({ submit: '소셜 로그인 중 오류가 발생했습니다.' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // 사용자 정보 업데이트
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('skillmap_user', JSON.stringify(updatedUser));
  }, [user]);

  // 폼 초기화
  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      agreeTerms: false,
    });
    setFormErrors({});
    setShowPassword(false);
  }, []);

  // Auth 다이얼로그 열기
  const openAuthDialog = useCallback((mode = 'login') => {
    setAuthDialog({ open: true, mode });
    resetForm();
  }, [resetForm]);

  // Auth 다이얼로그 닫기
  const closeAuthDialog = useCallback(() => {
    setAuthDialog({ open: false, mode: 'login' });
    resetForm();
    setIsSubmitting(false);
  }, [resetForm]);

  // 폼 제출
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm(authDialog.mode)) {
      return;
    }

    if (authDialog.mode === 'login') {
      await login(formData.email, formData.password);
    } else {
      await register(formData);
    }
  }, [authDialog.mode, formData, login, register, validateForm]);

  // 컨텍스트 값
  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    socialLogin,
    updateUser,
    openAuthDialog,
    closeAuthDialog,
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}

      {/* 인증 다이얼로그 */}
      <Dialog
        open={authDialog.open}
        onClose={closeAuthDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <IconButton
            onClick={closeAuthDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ mt: 2 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              SkillMap
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI 기반 커리어 분석 서비스
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 4 }}>
          {/* 탭 */}
          <Tabs
            value={authDialog.mode === 'login' ? 0 : 1}
            onChange={(e, value) => {
              setAuthDialog({ open: true, mode: value === 0 ? 'login' : 'register' });
              resetForm();
            }}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="로그인" />
            <Tab label="회원가입" />
          </Tabs>

          {/* 에러 메시지 */}
          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.submit}
            </Alert>
          )}

          {/* 로그인/회원가입 폼 */}
          <Box component="form" onSubmit={handleSubmit}>
            {authDialog.mode === 'register' && (
              <TextField
                fullWidth
                label="이름"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                margin="normal"
                disabled={isSubmitting}
              />
            )}

            <TextField
              fullWidth
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              margin="normal"
              disabled={isSubmitting}
            />

            <TextField
              fullWidth
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              margin="normal"
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {authDialog.mode === 'register' && (
              <>
                <TextField
                  fullWidth
                  label="비밀번호 확인"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  margin="normal"
                  disabled={isSubmitting}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeTerms}
                      onChange={(e) => updateFormData('agreeTerms', e.target.checked)}
                      disabled={isSubmitting}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      <Link href="#" color="primary">이용약관</Link> 및{' '}
                      <Link href="#" color="primary">개인정보처리방침</Link>에 동의합니다.
                    </Typography>
                  }
                />
                {formErrors.agreeTerms && (
                  <Typography variant="caption" color="error" display="block">
                    {formErrors.agreeTerms}
                  </Typography>
                )}
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                authDialog.mode === 'login' ? '로그인' : '회원가입'
              )}
            </Button>
          </Box>

          {/* 소셜 로그인 */}
          <Divider sx={{ my: 3 }}>또는</Divider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => socialLogin('google')}
              disabled={isSubmitting}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => socialLogin('facebook')}
              disabled={isSubmitting}
            >
              Facebook
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={() => socialLogin('github')}
              disabled={isSubmitting}
            >
              GitHub
            </Button>
          </Box>

          {/* 테스트 계정 안내 */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>테스트 계정:</strong><br />
              이메일: test@example.com<br />
              비밀번호: password123
            </Typography>
          </Alert>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  }
  return context;
};

export default AuthContext;