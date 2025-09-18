import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Skeleton,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircleFilled as PlayIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Book as BookIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { SkillMapAPI } from '../services/api';

const LearningPathsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [learningPaths, setLearningPaths] = useState([]);
  const [filteredPaths, setFilteredPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [enrolledPaths, setEnrolledPaths] = useState(new Set());
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    difficulty: '',
    duration: '',
    field: '',
    search: '',
  });

  // Mock 진행률 데이터
  const [progress, setProgress] = useState({
    1: { completed: 2, total: 4, percentage: 50 },
    2: { completed: 0, total: 4, percentage: 0 },
    3: { completed: 1, total: 5, percentage: 20 },
  });

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, learningPaths]);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      const data = await SkillMapAPI.getLearningPaths();
      setLearningPaths(data);
      setFilteredPaths(data);

      // URL 파라미터에서 특정 경로 선택
      const pathId = searchParams.get('path');
      if (pathId) {
        const path = data.find(p => p.id.toString() === pathId);
        if (path) {
          setSelectedPath(path);
        }
      }
    } catch (error) {
      console.error('학습 경로 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...learningPaths];

    if (filters.search) {
      filtered = filtered.filter(path =>
        path.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        path.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(path => path.difficulty === filters.difficulty);
    }

    if (filters.duration) {
      const [min, max] = filters.duration.split('-').map(Number);
      filtered = filtered.filter(path => {
        const months = parseInt(path.duration);
        return months >= min && months <= max;
      });
    }

    if (filters.field) {
      filtered = filtered.filter(path =>
        path.title.toLowerCase().includes(filters.field.toLowerCase())
      );
    }

    setFilteredPaths(filtered);
  };

  const handleEnroll = (pathId) => {
    const newEnrolled = new Set(enrolledPaths);
    if (newEnrolled.has(pathId)) {
      newEnrolled.delete(pathId);
    } else {
      newEnrolled.add(pathId);
    }
    setEnrolledPaths(newEnrolled);
  };

  const handleStepComplete = (pathId, stepIndex) => {
    const pathProgress = progress[pathId] || { completed: 0, total: 0 };
    const newCompleted = Math.min(stepIndex + 1, pathProgress.total);
    const newPercentage = Math.round((newCompleted / pathProgress.total) * 100);

    setProgress({
      ...progress,
      [pathId]: {
        ...pathProgress,
        completed: newCompleted,
        percentage: newPercentage,
      }
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  const getDurationColor = (duration) => {
    const months = parseInt(duration);
    if (months <= 3) return 'success';
    if (months <= 6) return 'warning';
    return 'error';
  };

  const renderPathCard = (path) => {
    const pathProgress = progress[path.id] || { completed: 0, total: path.steps?.length || 0, percentage: 0 };
    const isEnrolled = enrolledPaths.has(path.id);

    return (
      <Card
        key={path.id}
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: isEnrolled ? '2px solid' : '1px solid',
          borderColor: isEnrolled ? 'primary.main' : 'divider',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        }}
        onClick={() => setSelectedPath(path)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: getDifficultyColor(path.difficulty) + '.main',
              }}
            >
              <SchoolIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {path.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {path.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={path.difficulty}
                  color={getDifficultyColor(path.difficulty)}
                  size="small"
                />
                <Chip
                  label={path.duration}
                  color={getDurationColor(path.duration)}
                  size="small"
                  icon={<ScheduleIcon />}
                />
              </Box>
            </Box>
          </Box>

          {isEnrolled && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  진행률: {pathProgress.completed}/{pathProgress.total} 단계
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {pathProgress.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pathProgress.percentage}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={isEnrolled ? "outlined" : "contained"}
              size="small"
              startIcon={isEnrolled ? <CheckCircleIcon /> : <PersonAddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleEnroll(path.id);
              }}
            >
              {isEnrolled ? '등록됨' : '등록하기'}
            </Button>
            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
              <BookmarkIcon />
            </IconButton>
            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
              <ShareIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderDetailedPath = (path) => {
    const pathProgress = progress[path.id] || { completed: 0, total: path.steps?.length || 0, percentage: 0 };
    const isEnrolled = enrolledPaths.has(path.id);

    return (
      <Box>
        {/* Path Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: getDifficultyColor(path.difficulty) + '.main',
                }}
              >
                <SchoolIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  {path.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {path.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Chip
                    label={path.difficulty}
                    color={getDifficultyColor(path.difficulty)}
                    icon={<StarIcon />}
                  />
                  <Chip
                    label={path.duration}
                    color={getDurationColor(path.duration)}
                    icon={<ScheduleIcon />}
                  />
                  <Chip
                    label={`${path.steps?.length || 0}단계`}
                    icon={<BookIcon />}
                  />
                </Box>
                {isEnrolled && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      진행률: {pathProgress.completed}/{pathProgress.total} 단계 완료
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pathProgress.percentage}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant={isEnrolled ? "outlined" : "contained"}
                  size="large"
                  startIcon={isEnrolled ? <CheckCircleIcon /> : <PersonAddIcon />}
                  onClick={() => handleEnroll(path.id)}
                >
                  {isEnrolled ? '등록됨' : '등록하기'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {/* PDF 다운로드 기능 */}}
                >
                  PDF 다운로드
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Prerequisites and Outcomes */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon color="primary" />
                  사전 요구사항
                </Typography>
                <List dense>
                  {path.prerequisites?.map((req, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="warning" sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={req} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  학습 결과
                </Typography>
                <List dense>
                  {path.outcomes?.map((outcome, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={outcome} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Learning Steps */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookIcon color="primary" />
              학습 단계
            </Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
              {path.steps?.map((step, index) => {
                const isCompleted = isEnrolled && index < pathProgress.completed;
                const isCurrent = isEnrolled && index === pathProgress.completed;

                return (
                  <Step key={index} completed={isCompleted}>
                    <StepLabel
                      icon={
                        isCompleted ? (
                          <CheckCircleIcon color="success" />
                        ) : isCurrent ? (
                          <PlayIcon color="primary" />
                        ) : (
                          index + 1
                        )
                      }
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Phase {step.phase}: {step.title}
                        </Typography>
                        <Chip
                          label={step.duration}
                          size="small"
                          color="info"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>학습 주제:</strong> {step.topics?.join(', ')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>추천 자료:</strong>
                      </Typography>
                      <List dense>
                        {step.resources?.map((resource, resIndex) => (
                          <ListItem key={resIndex} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <BookIcon color="action" sx={{ fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText primary={resource} />
                          </ListItem>
                        ))}
                      </List>
                      {isEnrolled && !isCompleted && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStepComplete(path.id, index)}
                          sx={{ mt: 2 }}
                        >
                          단계 완료
                        </Button>
                      )}
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </CardContent>
        </Card>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (selectedPath) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => {
              setSelectedPath(null);
              setSearchParams({});
            }}
            sx={{ mb: 2 }}
          >
            ← 목록으로 돌아가기
          </Button>
        </Box>
        {renderDetailedPath(selectedPath)}
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          학습 경로
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          체계적인 로드맵으로 목표하는 커리어를 만들어보세요
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="전체 경로" />
          <Tab
            label={`내 경로 (${enrolledPaths.size})`}
            disabled={enrolledPaths.size === 0}
          />
        </Tabs>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="검색"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>난이도</InputLabel>
                <Select
                  value={filters.difficulty}
                  label="난이도"
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="Beginner">초급</MenuItem>
                  <MenuItem value="Intermediate">중급</MenuItem>
                  <MenuItem value="Advanced">고급</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>기간</InputLabel>
                <Select
                  value={filters.duration}
                  label="기간"
                  onChange={(e) => setFilters({...filters, duration: e.target.value})}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="1-3">1-3개월</MenuItem>
                  <MenuItem value="4-6">4-6개월</MenuItem>
                  <MenuItem value="7-12">7-12개월</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>분야</InputLabel>
                <Select
                  value={filters.field}
                  label="분야"
                  onChange={(e) => setFilters({...filters, field: e.target.value})}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="React">Frontend</MenuItem>
                  <MenuItem value="Python">Backend</MenuItem>
                  <MenuItem value="AI">AI/ML</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilters({ difficulty: '', duration: '', field: '', search: '' })}
                fullWidth
              >
                필터 초기화
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Learning Paths Grid */}
      <Grid container spacing={3}>
        {(activeTab === 0 ? filteredPaths : filteredPaths.filter(p => enrolledPaths.has(p.id)))
          .map((path) => (
          <Grid item xs={12} md={6} lg={4} key={path.id}>
            {renderPathCard(path)}
          </Grid>
        ))}
      </Grid>

      {filteredPaths.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          조건에 맞는 학습 경로가 없습니다. 필터를 조정해보세요.
        </Alert>
      )}
    </Container>
  );
};

export default LearningPathsPage;