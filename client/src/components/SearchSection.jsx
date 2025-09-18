import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Collapse,
  InputAdornment,
  Typography,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { filterOptions } from '../utils/mockData';

const SearchSection = () => {
  const { state, actions } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);

  const handleSearchChange = (event) => {
    actions.setSearchQuery(event.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    actions.setFilters({ [filterType]: value });
  };

  const handleFilterReset = () => {
    actions.setFilters({ experience: '', region: '', companySize: '' });
    actions.setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    return (
      Object.values(state.filters).filter(Boolean).length +
      (state.searchQuery ? 1 : 0)
    );
  };

  // 인기 키워드들
  const popularKeywords = [
    'React',
    'JavaScript',
    '마케팅',
    'UI/UX',
    'Python',
    '기획',
    'SQL',
    '디자인',
  ];

  return (
    <Box sx={{ mb: 6 }}>
      {/* Search Header - Simplified */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            mb: 1,
          }}
        >
          검색 및 필터
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            fontWeight: 400,
          }}
        >
          원하는 채용공고를 찾아보세요
        </Typography>
      </Box>

      {/* Main Search Bar - Clean */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="직무명, 회사명, 기술스택으로 검색해보세요"
          value={state.searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          inputProps={{ 'aria-label': '채용공고 검색어 입력' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" aria-hidden>
                <SearchIcon
                  sx={{
                    fontSize: 24,
                    color: '#64748b',
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: state.searchQuery && (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={() => actions.setSearchQuery('')}
                  aria-label="검색어 지우기"
                  sx={{
                    minWidth: 'auto',
                    p: 1,
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    },
                  }}
                >
                  <ClearIcon />
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'white',
              fontSize: '16px',
              fontWeight: 500,
              minHeight: '56px',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s ease',
              boxShadow: searchFocused
                ? '0 0 0 4px rgba(37, 99, 235, 0.10)'
                : 'none',
              '&:hover': {
                borderColor: '#cbd5e1',
              },
              '&.Mui-focused': {
                borderColor: 'var(--primary-color)',
                boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.10)',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: '16px 20px',
              '&::placeholder': {
                color: '#94a3b8',
                opacity: 1,
                fontSize: '16px',
                fontWeight: 400,
              },
            },
          }}
        />

        {/* Popular Keywords - Simplified */}
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: '#64748b',
              fontWeight: 500
            }}
          >
            인기 검색어
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {popularKeywords.map((keyword) => (
              <Button
                key={keyword}
                size="small"
                variant={
                  state.searchQuery === keyword ? 'contained' : 'text'
                }
                onClick={() => actions.setSearchQuery(keyword)}
                aria-label={`${keyword}로 검색`}
                sx={{
                  borderRadius: 2,
                  color: state.searchQuery === keyword ? 'white' : '#64748b',
                  backgroundColor: state.searchQuery === keyword ? 'var(--primary-color)' : 'transparent',
                  fontWeight: 500,
                  fontSize: '14px',
                  px: 2,
                  py: 1,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: state.searchQuery === keyword ? '#1d4ed8' : '#f1f5f9',
                  },
                }}
              >
                {keyword}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Filter Section - Simplified */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            필터
          </Typography>
          <Button
            variant="text"
            endIcon={filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setFilterExpanded(!filterExpanded)}
            aria-expanded={filterExpanded}
            aria-controls="filters-panel"
            sx={{
              color: '#64748b',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f1f5f9',
              },
            }}
          >
            {filterExpanded ? '접기' : '더보기'}
          </Button>
        </Box>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b', mr: 1 }}>
                적용된 필터:
              </Typography>
              {state.searchQuery && (
                <Chip
                  label={`"${state.searchQuery}"`}
                  onDelete={() => actions.setSearchQuery('')}
                  color="primary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              )}
              {state.filters.experience && (
                <Chip
                  label={state.filters.experience}
                  onDelete={() => handleFilterChange('experience', '')}
                  color="secondary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              )}
              {state.filters.region && (
                <Chip
                  label={state.filters.region}
                  onDelete={() => handleFilterChange('region', '')}
                  color="secondary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              )}
              {state.filters.companySize && (
                <Chip
                  label={state.filters.companySize}
                  onDelete={() => handleFilterChange('companySize', '')}
                  color="secondary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              )}
              <Button
                size="small"
                onClick={handleFilterReset}
                sx={{
                  color: '#64748b',
                  fontSize: '12px',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                }}
              >
                모두 지우기
              </Button>
            </Box>
          </Box>
        )}

        {/* Detailed Filter Options */}
        <Collapse in={filterExpanded} id="filters-panel">
          <Box
            sx={{
              p: 4,
              backgroundColor: '#f8fafc',
              borderRadius: 3,
              border: '1px solid var(--border-color)',
            }}
          >
            <Grid container spacing={4}>
              {/* Experience Level Filter */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      mb: 2,
                    }}
                  >
                    경험 수준
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
                    <InputLabel id="search-experience-label" shrink>
                      경험 수준
                    </InputLabel>
                    <Select
                      labelId="search-experience-label"
                      value={state.filters.experience}
                      label="경험 수준"
                      onChange={(e) =>
                        handleFilterChange('experience', e.target.value)
                      }
                      displayEmpty
                      renderValue={(value) =>
                        value ? value : <span style={{ color: '#94a3b8' }}>전체 수준</span>
                      }
                      inputProps={{ 'aria-label': '경험 수준 선택' }}
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
                          border: '1px solid var(--border-color)',
                          borderRadius: 3,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--primary-color)',
                          borderWidth: '1px',
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ py: 1.5, fontSize: '16px' }}>
                        <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                          경험 수준을 선택하세요
                        </Typography>
                      </MenuItem>
                      {filterOptions.experienceLevel.map((option) => (
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

              {/* Region Filter */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      mb: 2,
                    }}
                  >
                    근무 지역
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      mb: 3,
                    }}
                  >
                    원하는 근무 지역을 선택하세요
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="search-region-label" shrink>
                      근무 지역
                    </InputLabel>
                    <Select
                      labelId="search-region-label"
                      value={state.filters.region}
                      label="근무 지역"
                      onChange={(e) =>
                        handleFilterChange('region', e.target.value)
                      }
                      displayEmpty
                      renderValue={(value) =>
                        value ? value : <span style={{ color: '#94a3b8' }}>전체 지역</span>
                      }
                      inputProps={{ 'aria-label': '근무 지역 선택' }}
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
                          border: '1px solid var(--border-color)',
                          borderRadius: 3,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--primary-color)',
                          borderWidth: '1px',
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ py: 1.5, fontSize: '16px' }}>
                        <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                          지역을 선택하세요
                        </Typography>
                      </MenuItem>
                      {filterOptions.region.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ py: 1.5, fontSize: '16px' }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {option.label}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Company Size Filter */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      mb: 2,
                    }}
                  >
                    기업 규모
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
                    <InputLabel id="search-company-size-label" shrink>
                      기업 규모
                    </InputLabel>
                    <Select
                      labelId="search-company-size-label"
                      value={state.filters.companySize}
                      label="기업 규모"
                      onChange={(e) =>
                        handleFilterChange('companySize', e.target.value)
                      }
                      displayEmpty
                      renderValue={(value) =>
                        value ? value : <span style={{ color: '#94a3b8' }}>전체 규모</span>
                      }
                      inputProps={{ 'aria-label': '기업 규모 선택' }}
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
                          border: '1px solid var(--border-color)',
                          borderRadius: 3,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--primary-color)',
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

            {/* Filter Actions */}
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="text"
                onClick={handleFilterReset}
                sx={{
                  color: '#64748b',
                  fontWeight: 500,
                }}
              >
                초기화
              </Button>
              <Button
                variant="contained"
                onClick={() => setFilterExpanded(false)}
                sx={{
                  backgroundColor: 'var(--primary-color)',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                    boxShadow: 'none',
                  },
                }}
              >
                적용하기
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default SearchSection;