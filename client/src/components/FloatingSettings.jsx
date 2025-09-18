import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  LinearProgress,
  Collapse,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { jobCategories, filterOptions } from '../utils/mockData';

const FloatingSettings = ({
  onStartAnalysis,
  analysisStarted = false,
  analysisProgress = 0,
}) => {
  const { state, actions } = useApp();
  const [expanded, setExpanded] = useState(false);

  const handleSettingChange = (field, value) => {
    if (field === 'jobCategory') {
      actions.setAnalysisSettings({
        [field]: value,
        subCategory: '',
      });
    } else {
      actions.setAnalysisSettings({ [field]: value });
    }
  };

  const canStartAnalysis = () => {
    return (
      state.analysisSettings.jobCategory &&
      state.analysisSettings.experienceLevel &&
      !analysisStarted
    );
  };

  const getSubcategories = () => {
    if (
      state.analysisSettings.jobCategory &&
      jobCategories[state.analysisSettings.jobCategory]
    ) {
      return jobCategories[state.analysisSettings.jobCategory].subcategories;
    }
    return [];
  };

  const getProgressColor = () => {
    if (analysisProgress < 30) return '#f59e0b';
    if (analysisProgress < 70) return '#2563eb';
    return '#059669';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        top: 20,
        zIndex: 1000,
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        p: 3,
        mb: 4,
        backgroundColor: 'white',
        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: expanded ? 3 : 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ color: '#2563eb', fontSize: 28 }} />
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: '#0f172a',
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              AI 분석 설정
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontWeight: 400,
              }}
            >
              직군과 경험수준을 선택하세요
            </Typography>
          </Box>
        </Box>

        <Button
          variant="text"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            color: '#64748b',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#f1f5f9',
            },
          }}
        >
          {expanded ? '접기' : '설정하기'}
        </Button>
      </Box>

      {/* Quick Settings Summary */}
      {!expanded && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {state.analysisSettings.jobCategory && (
            <Chip
              label={state.analysisSettings.jobCategory}
              color="primary"
              size="small"
              sx={{ borderRadius: 2 }}
            />
          )}
          {state.analysisSettings.experienceLevel && (
            <Chip
              label={state.analysisSettings.experienceLevel}
              color="secondary"
              size="small"
              sx={{ borderRadius: 2 }}
            />
          )}
          {canStartAnalysis() ? (
            <Chip
              label="설정 완료"
              color="success"
              size="small"
              sx={{ borderRadius: 2 }}
            />
          ) : (
            <Chip
              label="설정 필요"
              color="warning"
              size="small"
              sx={{ borderRadius: 2 }}
            />
          )}
        </Box>
      )}

      {/* Start Analysis Button - Always Visible */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        startIcon={analysisStarted ? <TrendingUpIcon /> : <PlayIcon />}
        onClick={onStartAnalysis}
        disabled={!canStartAnalysis()}
        sx={{
          py: 2,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '16px',
          backgroundColor: canStartAnalysis() ? '#2563eb' : '#e5e7eb',
          color: canStartAnalysis() ? 'white' : '#9ca3af',
          boxShadow: 'none',
          mb: expanded ? 3 : 0,
          '&:hover': {
            backgroundColor: canStartAnalysis() ? '#1d4ed8' : '#e5e7eb',
            boxShadow: 'none',
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          },
          transition: 'all 0.2s ease',
        }}
      >
        {analysisStarted ? 'AI 분석 진행중...' : 'AI 분석 시작하기'}
      </Button>

      {/* Detailed Settings */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            {/* Job Category */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#0f172a',
                    mb: 1,
                  }}
                >
                  직군 선택 <Typography component="span" sx={{ color: '#ef4444' }}>*</Typography>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    mb: 3,
                  }}
                >
                  분석하고 싶은 직군을 선택하세요
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="jobCategory-label" shrink>
                    직군
                  </InputLabel>
                  <Select
                    labelId="jobCategory-label"
                    value={state.analysisSettings.jobCategory}
                    label="직군"
                    onChange={(e) =>
                      handleSettingChange('jobCategory', e.target.value)
                    }
                    displayEmpty
                    renderValue={(value) =>
                      value ? value : <span style={{ color: '#94a3b8' }}>전체 직군</span>
                    }
                    sx={{
                      minHeight: '56px',
                      backgroundColor: 'white',
                      '& .MuiSelect-select': {
                        padding: '14px 12px',
                        fontSize: '16px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563eb',
                        borderWidth: '1px',
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ py: 1.5, fontSize: '16px' }}>
                      <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        직군을 선택하세요
                      </Typography>
                    </MenuItem>
                    {Object.keys(jobCategories).map((category) => (
                      <MenuItem key={category} value={category} sx={{ py: 1.5, fontSize: '16px' }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {category}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {jobCategories[category].subcategories.slice(0, 3).join(', ')} 등
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Experience Level */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#0f172a',
                    mb: 1,
                  }}
                >
                  경험 수준 <Typography component="span" sx={{ color: '#ef4444' }}>*</Typography>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    mb: 3,
                  }}
                >
                  현재 본인의 경험 수준을 선택하세요
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="experienceLevel-label" shrink>
                    경험 수준
                  </InputLabel>
                  <Select
                    labelId="experienceLevel-label"
                    value={state.analysisSettings.experienceLevel}
                    label="경험 수준"
                    onChange={(e) =>
                      handleSettingChange('experienceLevel', e.target.value)
                    }
                    displayEmpty
                    renderValue={(value) =>
                      value ? value : <span style={{ color: '#94a3b8' }}>전체 수준</span>
                    }
                    sx={{
                      minHeight: '56px',
                      backgroundColor: 'white',
                      '& .MuiSelect-select': {
                        padding: '14px 12px',
                        fontSize: '16px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563eb',
                        borderWidth: '1px',
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ py: 1.5, fontSize: '16px' }}>
                      <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        경험 수준을 선택하세요
                      </Typography>
                    </MenuItem>
                    {filterOptions.experienceLevel
                      .filter((opt) => opt.value)
                      .map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ py: 1.5, fontSize: '16px' }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {option.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {option.value === '신입' && '0-1년 미만의 경험'}
                              {option.value === '1-3년차' && '1-3년의 실무 경험'}
                              {option.value === '경력무관' && '경력에 상관없이 지원 가능'}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Sub Category & Company Size - Side by Side */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#0f172a',
                    mb: 1,
                  }}
                >
                  세부직무 <Typography component="span" sx={{ color: '#94a3b8', fontSize: '14px' }}>(선택사항)</Typography>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    mb: 3,
                  }}
                >
                  더 정확한 분석을 위해 선택하세요
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="subCategory-label" shrink>
                    세부직무
                  </InputLabel>
                  <Select
                    labelId="subCategory-label"
                    value={state.analysisSettings.subCategory}
                    label="세부직무"
                    onChange={(e) =>
                      handleSettingChange('subCategory', e.target.value)
                    }
                    disabled={!state.analysisSettings.jobCategory}
                    displayEmpty
                    renderValue={(value) =>
                      value ? value : <span style={{ color: '#94a3b8' }}>전체 세부직무</span>
                    }
                    sx={{
                      minHeight: '56px',
                      backgroundColor: state.analysisSettings.jobCategory ? 'white' : '#f9fafb',
                      '& .MuiSelect-select': {
                        padding: '14px 12px',
                        fontSize: '16px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: `1px solid ${!state.analysisSettings.jobCategory ? '#f3f4f6' : '#e2e8f0'}`,
                        borderRadius: 3,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: state.analysisSettings.jobCategory ? '#cbd5e1' : '#f3f4f6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563eb',
                        borderWidth: '1px',
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ py: 1.5, fontSize: '16px' }}>
                      <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        {state.analysisSettings.jobCategory ? '세부직무 선택' : '먼저 직군을 선택하세요'}
                      </Typography>
                    </MenuItem>
                    {getSubcategories().map((sub) => (
                      <MenuItem key={sub} value={sub} sx={{ py: 1.5, fontSize: '16px' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {sub}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#0f172a',
                    mb: 1,
                  }}
                >
                  기업 규모 <Typography component="span" sx={{ color: '#94a3b8', fontSize: '14px' }}>(선택사항)</Typography>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    mb: 3,
                  }}
                >
                  원하는 기업 규모를 선택하세요
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="companySize-label" shrink>
                    기업 규모
                  </InputLabel>
                  <Select
                    labelId="companySize-label"
                    value={state.analysisSettings.companySize}
                    label="기업 규모"
                    onChange={(e) =>
                      handleSettingChange('companySize', e.target.value)
                    }
                    displayEmpty
                    renderValue={(value) =>
                      value ? value : <span style={{ color: '#94a3b8' }}>전체 규모</span>
                    }
                    sx={{
                      minHeight: '56px',
                      backgroundColor: 'white',
                      '& .MuiSelect-select': {
                        padding: '14px 12px',
                        fontSize: '16px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563eb',
                        borderWidth: '1px',
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ py: 1.5, fontSize: '16px' }}>
                      <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        기업 규모를 선택하세요
                      </Typography>
                    </MenuItem>
                    {filterOptions.companySize.map((option) => (
                      <MenuItem key={option.value} value={option.value} sx={{ py: 1.5, fontSize: '16px' }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {option.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {option.value === '스타트업' && '빠른 성장과 다양한 경험'}
                            {option.value === '중견기업' && '안정성과 성장성의 균형'}
                            {option.value === '대기업' && '체계적인 시스템과 복리후생'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>

          {!canStartAnalysis() && (
            <Typography
              variant="body2"
              sx={{
                color: '#f59e0b',
                fontWeight: 500,
                textAlign: 'center',
                mb: 2,
              }}
            >
              직군과 경험수준을 선택해주세요
            </Typography>
          )}
        </Box>
      </Collapse>

      {/* Progress Bar */}
      {analysisStarted && (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              분석 진행률
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: getProgressColor(),
              }}
            >
              {analysisProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={analysisProgress}
            sx={{
              borderRadius: 1,
              height: 8,
              backgroundColor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor(),
                borderRadius: 1,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              display: 'block',
              textAlign: 'center',
              color: '#64748b',
              fontWeight: 400,
            }}
          >
            {analysisProgress < 30 && '데이터 수집 중...'}
            {analysisProgress >= 30 &&
              analysisProgress < 70 &&
              'AI 분석 처리 중...'}
            {analysisProgress >= 70 &&
              analysisProgress < 100 &&
              '결과 생성 중...'}
            {analysisProgress >= 100 && '분석 완료!'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FloatingSettings;