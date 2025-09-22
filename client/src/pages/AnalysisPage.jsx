import React, { useState } from 'react';
import { Container, Box, Alert, Snackbar } from '@mui/material';
import { useApp } from '../contexts/AppContext';
import FloatingSettings from '../components/FloatingSettings';
import ResultsSection from '../components/ResultsSection';
import { SkillMapAPI } from '../services/api';

const AnalysisPage = () => {
  const { state, actions } = useApp();
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleStartAnalysis = async () => {
    // Validation
    if (
      !state.analysisSettings.jobCategory ||
      !state.analysisSettings.experienceLevel
    ) {
      setSnackbar({
        open: true,
        message: '직군과 경험수준을 모두 선택해주세요!',
        severity: 'warning',
      });
      return;
    }

    try {
      // Clear previous results
      actions.setAnalysisResults(null);
      actions.setError(null);

      // Start analysis
      setAnalysisStarted(true);
      setAnalysisProgress(0);
      actions.setLoading(true);

      // Show start notification
      setSnackbar({
        open: true,
        message: '🚀 AI 분석을 시작합니다!',
        severity: 'info',
      });

      // Simulate analysis progress
      const progressSteps = [
        { progress: 10, message: '📊 채용공고 데이터 수집 중...' },
        { progress: 25, message: '🔍 키워드 분석 중...' },
        { progress: 45, message: '🤖 AI 모델 처리 중...' },
        { progress: 65, message: '📈 트렌드 분석 중...' },
        { progress: 80, message: '💰 연봉 정보 분석 중...' },
        { progress: 95, message: '📋 결과 생성 중...' },
        { progress: 100, message: '✅ 분석 완료!' },
      ];

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setAnalysisProgress(step.progress);

        // Show progress messages
        if (
          step.progress === 25 ||
          step.progress === 65 ||
          step.progress === 95
        ) {
          setSnackbar({
            open: true,
            message: step.message,
            severity: 'info',
          });
        }
      }

      // 실제 분석 API 호출
      const analysisResult = await SkillMapAPI.startAnalysis({
        jobCategory: state.analysisSettings.jobCategory,
        experienceLevel: state.analysisSettings.experienceLevel,
        region: state.analysisSettings.region
      });

      actions.setAnalysisResults([analysisResult]);

      // Success notification
      setSnackbar({
        open: true,
        message: '🎉 분석이 완료되었습니다!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      actions.setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setSnackbar({
        open: true,
        message: '❌ 분석 중 오류가 발생했습니다.',
        severity: 'error',
      });
    } finally {
      actions.setLoading(false);
      setAnalysisStarted(false);
      setAnalysisProgress(0);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
      {/* Error Alert */}
      {state.error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            border: '2px solid #f44336',
            borderRadius: 2,
          }}
          onClose={() => actions.clearError()}
        >
          {state.error}
        </Alert>
      )}

      {/* Floating Settings Component */}
      <FloatingSettings
        onStartAnalysis={handleStartAnalysis}
        analysisStarted={analysisStarted}
        analysisProgress={analysisProgress}
      />

      {/* Results Section */}
      <ResultsSection />

      {/* Loading Overlay */}
      {state.loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              p: 4,
              borderRadius: 3,
              border: '2px solid #333',
              textAlign: 'center',
              maxWidth: 400,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #1976d2',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </Box>
            <Box sx={{ color: '#666', fontSize: '14px' }}>
              AI가 열심히 분석하고 있어요... 🤖
            </Box>
          </Box>
        </Box>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            border: '2px solid',
            borderColor:
              snackbar.severity === 'success'
                ? '#4caf50'
                : snackbar.severity === 'error'
                  ? '#f44336'
                  : snackbar.severity === 'warning'
                    ? '#ff9800'
                    : '#2196f3',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AnalysisPage;
