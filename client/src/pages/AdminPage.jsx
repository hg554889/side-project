import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  Switch,
  FormControlLabel,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  CloudDownload as CloudDownloadIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { SkillMapAPI } from '../services/api';
import SkillDemandChart from '../components/charts/SkillDemandChart';
import SalaryTrendChart from '../components/charts/SalaryTrendChart';
import MarketOverviewChart from '../components/charts/MarketOverviewChart';

const AdminPage = () => {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState(null);
  const [crawlingStatus, setCrawlingStatus] = useState('idle');
  const [dbStats, setDbStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [crawlingDialog, setCrawlingDialog] = useState(false);
  const [crawlingParams, setCrawlingParams] = useState({
    keyword: 'React',
    jobCategory: 'IT/개발',
    experienceLevel: '신입',
    region: '서울',
  });

  // Mock 차트 데이터
  const skillDemandData = [
    { name: 'JavaScript', percentage: 92 },
    { name: 'React', percentage: 85 },
    { name: 'Python', percentage: 78 },
    { name: 'TypeScript', percentage: 67 },
    { name: 'Node.js', percentage: 54 },
  ];

  const salaryTrendData = [
    { name: '신입', min: 3000, avg: 3750, max: 4500 },
    { name: '1-3년', min: 4000, avg: 5000, max: 6000 },
    { name: '4-6년', min: 5500, avg: 6750, max: 8000 },
    { name: '7년+', min: 7000, avg: 9500, max: 12000 },
  ];

  const marketPieData = [
    { name: 'IT/개발', value: 45 },
    { name: '마케팅', value: 20 },
    { name: '디자인', value: 15 },
    { name: '기획', value: 12 },
    { name: '기타', value: 8 },
  ];

  const marketGrowthData = [
    { name: 'AI/ML', growth: 45 },
    { name: 'Frontend', growth: 15 },
    { name: 'Backend', growth: 22 },
    { name: 'DevOps', growth: 38 },
  ];

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statusData] = await Promise.all([
          SkillMapAPI.getSystemStatus(),
        ]);

        setSystemStatus(statusData);

        // Mock 데이터
        setDbStats({
          totalJobs: 12847,
          totalAnalysis: 3456,
          activeUsers: 892,
          dbSize: '2.3GB',
          lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        });

        setRecentLogs([
          {
            id: 1,
            timestamp: new Date().toISOString(),
            level: 'info',
            message: '크롤링 작업 완료: React 개발자 245개 공고',
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            level: 'success',
            message: '데이터베이스 백업 완료',
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            level: 'warning',
            message: 'API 요청 한도 80% 도달',
          },
          {
            id: 4,
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            level: 'error',
            message: '외부 API 연결 실패 (재시도 성공)',
          },
        ]);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleStartCrawling = async () => {
    try {
      setCrawlingStatus('running');
      setCrawlingDialog(false);

      // Mock 크롤링 프로세스 시뮬레이션
      setTimeout(() => {
        setCrawlingStatus('completed');
        setRecentLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          level: 'success',
          message: `크롤링 완료: ${crawlingParams.keyword} ${crawlingParams.experienceLevel} 공고 수집`,
        }, ...prev]);

        setTimeout(() => setCrawlingStatus('idle'), 3000);
      }, 5000);

    } catch (err) {
      setError(err.message);
      setCrawlingStatus('idle');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    }
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 16 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800', fontSize: 16 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336', fontSize: 16 }} />;
      default:
        return <BugReportIcon sx={{ color: '#2196f3', fontSize: 16 }} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          관리자 권한이 필요합니다: {error}
        </Alert>
        <Button onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            관리자 대시보드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            시스템 상태 모니터링 및 관리
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => setCrawlingDialog(true)}
            disabled={crawlingStatus === 'running'}
          >
            크롤링 시작
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </Box>
      </Box>

      {/* System Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              {getStatusIcon(systemStatus?.status)}
              <Typography variant="h6" sx={{ mt: 1, mb: 0.5 }}>
                시스템 상태
              </Typography>
              <Chip
                label={systemStatus?.status || 'Unknown'}
                color={systemStatus?.status === 'healthy' ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StorageIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                데이터베이스
              </Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                {dbStats?.totalJobs?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                채용공고
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                활성 사용자
              </Typography>
              <Typography variant="h5" color="success.main" sx={{ fontWeight: 600 }}>
                {dbStats?.activeUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                현재 접속중
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                분석 결과
              </Typography>
              <Typography variant="h5" color="warning.main" sx={{ fontWeight: 600 }}>
                {dbStats?.totalAnalysis?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 생성된 분석
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <SkillDemandChart
            data={skillDemandData}
            title="실시간 스킬 요구도"
          />
        </Grid>

        <Grid item xs={12} lg={6}>
          <SalaryTrendChart
            data={salaryTrendData}
            title="경력별 연봉 분포"
            type="line"
          />
        </Grid>

        <Grid item xs={12}>
          <MarketOverviewChart
            pieData={marketPieData}
            barData={marketGrowthData}
            title="시장 현황 분석"
            showPie={true}
            showBar={true}
          />
        </Grid>
      </Grid>

      {/* Management Tools */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon color="primary" />
                최근 로그
              </Typography>
              <List>
                {recentLogs.map((log) => (
                  <ListItem key={log.id} divider>
                    <ListItemIcon>
                      {getLogIcon(log.level)}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.message}
                      secondary={new Date(log.timestamp).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon color="primary" />
                크롤링 상태
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={
                    crawlingStatus === 'running' ? '실행 중' :
                    crawlingStatus === 'completed' ? '완료' : '대기 중'
                  }
                  color={
                    crawlingStatus === 'running' ? 'warning' :
                    crawlingStatus === 'completed' ? 'success' : 'default'
                  }
                  variant="outlined"
                />
              </Box>
              {crawlingStatus === 'running' && (
                <LinearProgress sx={{ mb: 2 }} />
              )}
              <Typography variant="body2" color="text.secondary">
                마지막 크롤링: {systemStatus?.lastCrawl ?
                  new Date(systemStatus.lastCrawl).toLocaleString() : '없음'}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon color="primary" />
                빠른 작업
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CloudDownloadIcon />}
                  size="small"
                >
                  데이터 백업
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  color="error"
                  size="small"
                >
                  캐시 정리
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  size="small"
                >
                  인덱스 재구성
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Crawling Dialog */}
      <Dialog open={crawlingDialog} onClose={() => setCrawlingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>크롤링 설정</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="검색 키워드"
              value={crawlingParams.keyword}
              onChange={(e) => setCrawlingParams({...crawlingParams, keyword: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="직군"
              value={crawlingParams.jobCategory}
              onChange={(e) => setCrawlingParams({...crawlingParams, jobCategory: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="경험 수준"
              value={crawlingParams.experienceLevel}
              onChange={(e) => setCrawlingParams({...crawlingParams, experienceLevel: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="지역"
              value={crawlingParams.region}
              onChange={(e) => setCrawlingParams({...crawlingParams, region: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCrawlingDialog(false)}>
            취소
          </Button>
          <Button
            onClick={handleStartCrawling}
            variant="contained"
            disabled={!crawlingParams.keyword}
          >
            시작
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;