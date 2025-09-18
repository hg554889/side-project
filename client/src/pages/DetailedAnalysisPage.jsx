import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  LinearProgress,
  Divider,
  Alert,
  Skeleton,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { SkillMapAPI } from '../services/api';

const DetailedAnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const data = await SkillMapAPI.getAnalysisResult(id);
        setAnalysisData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysisData();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
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
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/analysis')}
        >
          돌아가기
        </Button>
      </Container>
    );
  }

  if (!analysisData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          분석 결과를 찾을 수 없습니다.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/analysis')}
        >
          돌아가기
        </Button>
      </Container>
    );
  }

  const getSkillLevel = (percentage) => {
    if (percentage >= 80) return { level: 'Expert', color: 'success' };
    if (percentage >= 60) return { level: 'Advanced', color: 'primary' };
    if (percentage >= 40) return { level: 'Intermediate', color: 'warning' };
    return { level: 'Beginner', color: 'error' };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate('/analysis')}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            상세 분석 결과
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {analysisData.title} • {new Date(analysisData.id).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 핵심 인사이트 */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon color="primary" />
                핵심 인사이트
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {analysisData.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={analysisData.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={analysisData.trend === 'up' ? '상승 트렌드' : '하락 트렌드'}
                  color={analysisData.trend === 'up' ? 'success' : 'error'}
                  variant="outlined"
                />
                <Chip
                  label={analysisData.category}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 상세 분석 내용 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon color="primary" />
                주요 발견사항
              </Typography>
              {analysisData.details?.map((detail, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • {detail}
                  </Typography>
                  {index < analysisData.details.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 스킬 요구도 (Mock 데이터) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                스킬 요구도
              </Typography>
              {[
                { name: 'JavaScript', percentage: 92 },
                { name: 'React', percentage: 85 },
                { name: 'TypeScript', percentage: 67 },
                { name: 'Node.js', percentage: 54 },
                { name: 'Git', percentage: 89 },
              ].map((skill, index) => {
                const skillInfo = getSkillLevel(skill.percentage);
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {skill.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={skillInfo.level}
                          size="small"
                          color={skillInfo.color}
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {skill.percentage}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={skill.percentage}
                      color={skillInfo.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* 연봉 정보 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="primary" />
                연봉 정보
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  3,500만원
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  신입 평균 연봉
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      3,000만원
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      최소 연봉
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      4,500만원
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      최대 연봉
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 학습 추천 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="primary" />
                추천 학습 경로
              </Typography>
              {[
                { phase: 1, title: 'JavaScript 기초 강화', status: 'urgent' },
                { phase: 2, title: 'React 심화 학습', status: 'recommended' },
                { phase: 3, title: 'TypeScript 도입', status: 'optional' },
                { phase: 4, title: '포트폴리오 프로젝트', status: 'essential' },
              ].map((step, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {step.phase}
                    </Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: 1 }}>
                      {step.title}
                    </Typography>
                    <Chip
                      label={step.status}
                      size="small"
                      color={
                        step.status === 'urgent' ? 'error' :
                        step.status === 'essential' ? 'warning' :
                        step.status === 'recommended' ? 'primary' : 'default'
                      }
                      variant="outlined"
                    />
                  </Box>
                  {index < 3 && <Divider sx={{ ml: 4 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 추가 정보 및 액션 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                다음 단계
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SchoolIcon />}
                    onClick={() => navigate('/learning-paths')}
                  >
                    학습 경로 보기
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TimelineIcon />}
                    onClick={() => navigate('/trends')}
                  >
                    트렌드 분석
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<WorkIcon />}
                    onClick={() => navigate('/')}
                  >
                    채용공고 찾기
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LocationIcon />}
                    onClick={() => navigate('/compare')}
                  >
                    분야 비교
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DetailedAnalysisPage;