import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  TrendingFlat as TrendingFlatIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

const ResultsSection = () => {
  const { state } = useApp();

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
      case 'stable':
        return <TrendingFlatIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
      default:
        return <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return '#4caf50';
      case 'stable':
        return '#ff9800';
      default:
        return '#4caf50';
    }
  };

  const getTrendLabel = (trend) => {
    switch (trend) {
      case 'up':
        return '상승';
      case 'stable':
        return '안정';
      default:
        return '상승';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'skills':
        return '🔧';
      case 'experience':
        return '📈';
      case 'learning':
        return '📚';
      case 'salary':
        return '💰';
      default:
        return '📊';
    }
  };

  const EmptyState = () => (
    <Card
      elevation={0}
      sx={{
        border: '2px solid #333',
        borderRadius: 3,
        textAlign: 'center',
        py: 8,
      }}
    >
      <CardContent>
        <AnalyticsIcon
          sx={{
            fontSize: 80,
            color: '#ccc',
            mb: 2,
          }}
        />
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: '#666',
          }}
        >
          분석을 시작하세요
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#999',
            maxWidth: 400,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          위 설정에서 직군과 경험수준을 선택한 후<br />
          분석 버튼을 클릭해주세요
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="caption"
            sx={{ color: '#ccc', mb: 2, display: 'block' }}
          >
            분석 예시 항목
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Chip
              label="🔧 기술 스택 분석"
              size="small"
              variant="outlined"
              disabled
            />
            <Chip
              label="📈 연봉 정보"
              size="small"
              variant="outlined"
              disabled
            />
            <Chip
              label="📚 학습 로드맵"
              size="small"
              variant="outlined"
              disabled
            />
            <Chip
              label="💼 취업 전망"
              size="small"
              variant="outlined"
              disabled
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ResultCard = ({ result, index }) => (
    <Grid item xs={12} key={result.id}>
      <Card
        elevation={0}
        sx={{
          border: '2px solid #e3f2fd',
          borderRadius: 2,
          backgroundColor: '#f8fffe',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#1976d2',
            boxShadow: '0 4px 12px rgba(25,118,210,0.1)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              mb: 2,
            }}
          >
            {/* Category Icon */}
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: getTrendColor(result.trend),
                fontSize: '18px',
              }}
            >
              {getCategoryIcon(result.category)}
            </Avatar>

            {/* Content */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#333',
                  }}
                >
                  {result.title}
                </Typography>

                <Chip
                  icon={getTrendIcon(result.trend)}
                  label={getTrendLabel(result.trend)}
                  size="small"
                  sx={{
                    backgroundColor: `${getTrendColor(result.trend)}20`,
                    color: getTrendColor(result.trend),
                    border: `1px solid ${getTrendColor(result.trend)}`,
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: '#666',
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                {result.description}
              </Typography>

              {/* Details List */}
              {result.details && (
                <Box
                  sx={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#333',
                    }}
                  >
                    📋 상세 분석
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    {result.details.map((detail, detailIndex) => (
                      <ListItem key={detailIndex} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`• ${detail}`}
                          primaryTypographyProps={{
                            fontSize: '14px',
                            color: '#555',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  if (!state.analysisResults) {
    return <EmptyState />;
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: '2px solid #333',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <TrendingUpIcon
            sx={{
              fontSize: 32,
              color: '#1976d2',
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#333',
            }}
          >
            📊 분석 결과
          </Typography>
          <Chip
            label={`${state.analysisSettings.jobCategory} · ${state.analysisSettings.experienceLevel}`}
            color="primary"
            variant="outlined"
            sx={{
              border: '1.5px solid #1976d2',
              fontWeight: 600,
            }}
          />
        </Box>

        <Divider
          sx={{
            mb: 4,
            borderColor: '#333',
            borderWidth: '1px',
          }}
        />

        {/* Results Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {state.analysisResults.map((result, index) => (
            <ResultCard key={result.id} result={result} index={index} />
          ))}
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            sx={{
              border: '2px solid #333',
              borderRadius: '25px',
              color: '#333',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#f5f5f5',
                transform: 'translateY(-1px)',
              },
            }}
          >
            맞춤 학습 플랜 보기
          </Button>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            sx={{
              backgroundColor: '#1976d2',
              border: '2px solid #333',
              borderRadius: '25px',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#1565c0',
                transform: 'translateY(-1px)',
              },
            }}
          >
            상세 분석 보고서
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExpandMoreIcon />}
            color="secondary"
            sx={{
              border: '2px solid #4caf50',
              borderRadius: '25px',
              color: '#2e7d32',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#e8f5e8',
                transform: 'translateY(-1px)',
              },
            }}
          >
            다른 직군 분석하기
          </Button>
        </Box>

        {/* Summary Stats */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: '#333',
              textAlign: 'center',
            }}
          >
            🎯 분석 요약
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: '#1976d2' }}
                >
                  {state.analysisResults.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  분석 항목
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: '#4caf50' }}
                >
                  95%
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  신뢰도
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: '#ff9800' }}
                >
                  1,247
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  분석 채용공고
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: '#9c27b0' }}
                >
                  3.2초
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  분석 시간
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResultsSection;
