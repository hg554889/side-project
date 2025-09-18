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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Skeleton,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Compare as CompareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { SkillMapAPI } from '../services/api';
import SalaryTrendChart from '../components/charts/SalaryTrendChart';
import SkillDemandChart from '../components/charts/SkillDemandChart';

const ComparisonPage = () => {
  const navigate = useNavigate();
  const [selectedFields, setSelectedFields] = useState(['IT/개발', '마케팅']);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableFields = [
    'IT/개발',
    '마케팅',
    '디자인',
    '기획',
    '영업/세일즈',
    '보안',
    '금융',
    '데이터분석',
  ];

  // Mock 비교 데이터
  const mockComparisonData = {
    fields: selectedFields,
    skillComparison: {
      'IT/개발': [
        { name: 'JavaScript', percentage: 92 },
        { name: 'React', percentage: 85 },
        { name: 'Python', percentage: 78 },
        { name: 'TypeScript', percentage: 67 },
        { name: 'Node.js', percentage: 54 },
      ],
      '마케팅': [
        { name: 'Google Analytics', percentage: 88 },
        { name: 'Facebook 광고', percentage: 75 },
        { name: 'SQL', percentage: 65 },
        { name: 'Excel', percentage: 90 },
        { name: 'Tableau', percentage: 45 },
      ],
      '디자인': [
        { name: 'Figma', percentage: 95 },
        { name: 'Photoshop', percentage: 82 },
        { name: 'Sketch', percentage: 68 },
        { name: 'Illustrator', percentage: 71 },
        { name: 'Adobe XD', percentage: 58 },
      ],
    },
    salaryComparison: {
      'IT/개발': [
        { name: '신입', min: 3500, avg: 4200, max: 5000 },
        { name: '1-3년', min: 4500, avg: 5500, max: 6500 },
        { name: '4-6년', min: 6000, avg: 7500, max: 9000 },
        { name: '7년+', min: 8000, avg: 10500, max: 13000 },
      ],
      '마케팅': [
        { name: '신입', min: 3000, avg: 3500, max: 4000 },
        { name: '1-3년', min: 3500, avg: 4500, max: 5500 },
        { name: '4-6년', min: 5000, avg: 6500, max: 8000 },
        { name: '7년+', min: 7000, avg: 9000, max: 11000 },
      ],
      '디자인': [
        { name: '신입', min: 2800, avg: 3300, max: 3800 },
        { name: '1-3년', min: 3300, avg: 4200, max: 5000 },
        { name: '4-6년', min: 4500, avg: 5800, max: 7000 },
        { name: '7년+', min: 6000, avg: 8000, max: 10000 },
      ],
    },
    marketInsights: {
      'IT/개발': {
        totalJobs: 5420,
        growthRate: '+15%',
        competitionLevel: 'High',
        hotSkills: ['React', 'TypeScript', 'AWS'],
        avgSalary: '5,200만원',
      },
      '마케팅': {
        totalJobs: 2150,
        growthRate: '+8%',
        competitionLevel: 'Medium',
        hotSkills: ['데이터분석', 'SEO', 'Contents'],
        avgSalary: '4,100만원',
      },
      '디자인': {
        totalJobs: 1680,
        growthRate: '+5%',
        competitionLevel: 'Medium',
        hotSkills: ['UI/UX', 'Figma', 'Prototyping'],
        avgSalary: '3,800만원',
      },
    },
    recommendations: [
      {
        field: 'IT/개발',
        priority: 'High',
        reason: '높은 연봉과 많은 기회',
        skills: ['React', 'TypeScript'],
        timeToJob: '3-6개월',
      },
      {
        field: '마케팅',
        priority: 'Medium',
        reason: '안정적인 성장과 다양한 기회',
        skills: ['데이터분석', 'SQL'],
        timeToJob: '2-4개월',
      },
    ],
  };

  useEffect(() => {
    if (selectedFields.length >= 2) {
      handleCompareFields();
    }
  }, [selectedFields]);

  const handleCompareFields = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));
      setComparisonData(mockComparisonData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, value) => {
    const newFields = [...selectedFields];
    newFields[index] = value;
    setSelectedFields(newFields);
  };

  const addField = () => {
    if (selectedFields.length < 3) {
      setSelectedFields([...selectedFields, availableFields[0]]);
    }
  };

  const removeField = (index) => {
    if (selectedFields.length > 2) {
      const newFields = selectedFields.filter((_, i) => i !== index);
      setSelectedFields(newFields);
    }
  };

  const getCompetitionColor = (level) => {
    switch (level) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'success';
      case 'Medium': return 'warning';
      case 'Low': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          분야별 비교 분석
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          서로 다른 직무 분야를 비교하여 최적의 커리어 경로를 찾아보세요
        </Typography>

        {/* Field Selection */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            비교할 분야 선택
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {selectedFields.map((field, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>분야 {index + 1}</InputLabel>
                  <Select
                    value={field}
                    label={`분야 ${index + 1}`}
                    onChange={(e) => handleFieldChange(index, e.target.value)}
                  >
                    {availableFields.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedFields.length > 2 && (
                  <IconButton
                    onClick={() => removeField(index)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            {selectedFields.length < 3 && (
              <IconButton
                onClick={addField}
                color="primary"
                sx={{ border: '2px dashed', borderColor: 'primary.main' }}
              >
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<CompareIcon />}
              onClick={handleCompareFields}
              disabled={loading || selectedFields.length < 2}
            >
              분석 시작
            </Button>
          </Box>
        </Card>
      </Box>

      {loading && (
        <Box sx={{ mb: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            분야별 데이터를 분석하고 있습니다...
          </Alert>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {comparisonData && !loading && (
        <>
          {/* Market Overview Comparison */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon color="primary" />
                시장 현황 비교
              </Typography>
            </Grid>
            {selectedFields.map((field, index) => {
              const data = comparisonData.marketInsights[field];
              if (!data) return null;

              return (
                <Grid item xs={12} md={4} key={field}>
                  <Card>
                    <CardContent>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: index === 0 ? 'primary.main' : index === 1 ? 'secondary.main' : 'warning.main',
                            mx: 'auto',
                            mb: 1,
                          }}
                        >
                          <WorkIcon sx={{ fontSize: 30 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {field}
                        </Typography>
                      </Box>

                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell><strong>채용공고</strong></TableCell>
                            <TableCell>{data.totalJobs.toLocaleString()}개</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>성장률</strong></TableCell>
                            <TableCell>
                              <Chip
                                label={data.growthRate}
                                size="small"
                                color={parseInt(data.growthRate) > 10 ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>경쟁도</strong></TableCell>
                            <TableCell>
                              <Chip
                                label={data.competitionLevel}
                                size="small"
                                color={getCompetitionColor(data.competitionLevel)}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>평균 연봉</strong></TableCell>
                            <TableCell>{data.avgSalary}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          핫 스킬
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {data.hotSkills.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Skill Comparison Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                스킬 요구도 비교
              </Typography>
            </Grid>
            {selectedFields.map((field) => {
              const skillData = comparisonData.skillComparison[field];
              if (!skillData) return null;

              return (
                <Grid item xs={12} md={6} key={field}>
                  <SkillDemandChart
                    data={skillData}
                    title={`${field} 스킬 요구도`}
                  />
                </Grid>
              );
            })}
          </Grid>

          {/* Salary Comparison */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="primary" />
                연봉 비교 분석
              </Typography>
            </Grid>
            {selectedFields.map((field) => {
              const salaryData = comparisonData.salaryComparison[field];
              if (!salaryData) return null;

              return (
                <Grid item xs={12} md={6} key={field}>
                  <SalaryTrendChart
                    data={salaryData}
                    title={`${field} 경력별 연봉`}
                    type="line"
                  />
                </Grid>
              );
            })}
          </Grid>

          {/* Recommendations */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="primary" />
                맞춤 추천
              </Typography>
            </Grid>
            {comparisonData.recommendations.map((rec, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip
                        label={rec.priority}
                        color={getPriorityColor(rec.priority)}
                        icon={<StarIcon />}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {rec.field}
                      </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>추천 이유:</strong> {rec.reason}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>핵심 스킬:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                      {rec.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      <strong>예상 취업 기간:</strong> {rec.timeToJob}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ textAlign: 'center' }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/analysis')}
                >
                  상세 분석 받기
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
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
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/trends')}
                >
                  시장 트렌드
                </Button>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ComparisonPage;