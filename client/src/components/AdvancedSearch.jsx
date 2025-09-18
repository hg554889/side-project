import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Grid,
  Divider,
  Alert,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const AdvancedSearch = ({ open, onClose, onSearch, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    jobCategory: '',
    experienceLevel: '',
    region: '',
    companySize: '',
    salary: [3000, 8000],
    skills: [],
    benefits: [],
    workType: '',
    industry: '',
    companyName: '',
    excludeKeywords: '',
    postedWithin: '',
    sortBy: 'relevance',
    ...initialFilters
  });

  const [savedSearches, setSavedSearches] = useState([
    {
      id: 1,
      name: 'React 신입 개발자',
      filters: {
        keyword: 'React',
        experienceLevel: '신입',
        skills: ['JavaScript', 'React'],
        region: '서울',
      },
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      name: '네이버 경력직',
      filters: {
        companyName: '네이버',
        experienceLevel: '1-3년차',
        salary: [4000, 6000],
      },
      lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  // 선택 옵션들
  const OPTIONS = {
    jobCategories: [
      'IT/개발', '마케팅', '디자인', '기획', '영업/세일즈', '보안', '금융', '데이터분석'
    ],
    experienceLevels: [
      '신입', '1-3년차', '4-6년차', '7년차+', '경력무관'
    ],
    regions: [
      '서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '원격근무'
    ],
    companySizes: [
      '스타트업', '중견기업', '대기업', '외국계'
    ],
    industries: [
      'IT서비스', '게임', '핀테크', '이커머스', '교육', '미디어', '의료', '제조업', '금융'
    ],
    workTypes: [
      '정규직', '계약직', '인턴', '프리랜서', '파트타임'
    ],
    skills: [
      'JavaScript', 'React', 'Vue.js', 'Angular', 'TypeScript', 'Node.js',
      'Python', 'Java', 'Spring', 'Django', 'PHP', 'C++', 'C#',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux', 'MySQL', 'MongoDB',
      'Figma', 'Photoshop', 'Sketch', 'Adobe XD', 'Illustrator',
      'Google Analytics', 'Excel', 'SQL', 'Tableau', 'PowerBI'
    ],
    benefits: [
      '4대보험', '퇴직연금', '연차', '리프레시휴가', '교육비지원', '건강검진',
      '식사지원', '간식제공', '자유복장', '재택근무', '유연근무', '주차지원',
      '성과급', '스톡옵션', '복지포인트', '동호회지원', '경조휴가', '출산휴가'
    ],
    postedWithinOptions: [
      { value: '', label: '전체' },
      { value: '1', label: '1일 이내' },
      { value: '3', label: '3일 이내' },
      { value: '7', label: '1주일 이내' },
      { value: '14', label: '2주일 이내' },
      { value: '30', label: '1개월 이내' },
    ],
    sortOptions: [
      { value: 'relevance', label: '관련도순' },
      { value: 'recent', label: '최신순' },
      { value: 'salary', label: '연봉순' },
      { value: 'company', label: '회사명순' },
    ],
  };

  // 필터 업데이트
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setFilters({
      keyword: '',
      jobCategory: '',
      experienceLevel: '',
      region: '',
      companySize: '',
      salary: [3000, 8000],
      skills: [],
      benefits: [],
      workType: '',
      industry: '',
      companyName: '',
      excludeKeywords: '',
      postedWithin: '',
      sortBy: 'relevance',
    });
  }, []);

  // 검색 실행
  const handleSearch = useCallback(() => {
    onSearch(filters);
    onClose();
  }, [filters, onSearch, onClose]);

  // 저장된 검색 불러오기
  const loadSavedSearch = useCallback((savedSearch) => {
    setFilters(prev => ({ ...prev, ...savedSearch.filters }));
    setSavedSearches(prev =>
      prev.map(search =>
        search.id === savedSearch.id
          ? { ...search, lastUsed: new Date() }
          : search
      )
    );
  }, []);

  // 검색 저장
  const saveSearch = useCallback(() => {
    if (!searchName.trim()) return;

    const newSearch = {
      id: Date.now(),
      name: searchName.trim(),
      filters: { ...filters },
      lastUsed: new Date(),
    };

    setSavedSearches(prev => [newSearch, ...prev]);
    setSearchName('');
    setShowSaveDialog(false);
  }, [searchName, filters]);

  // 저장된 검색 삭제
  const deleteSavedSearch = useCallback((id) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  }, []);

  // 활성 필터 개수 계산
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.jobCategory) count++;
    if (filters.experienceLevel) count++;
    if (filters.region) count++;
    if (filters.companySize) count++;
    if (filters.skills.length > 0) count++;
    if (filters.benefits.length > 0) count++;
    if (filters.workType) count++;
    if (filters.industry) count++;
    if (filters.companyName) count++;
    if (filters.excludeKeywords) count++;
    if (filters.postedWithin) count++;
    if (filters.salary[0] !== 3000 || filters.salary[1] !== 8000) count++;
    return count;
  }, [filters]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon color="primary" />
            <Typography variant="h6">고급 검색</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount}개 필터 활성`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <IconButton onClick={onClose} aria-label="닫기">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {/* 저장된 검색 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="saved-searches" id="saved-searches-header">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon color="action" />
                <Typography>저장된 검색 ({savedSearches.length})</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {savedSearches.map((search) => (
                  <Grid item xs={12} sm={6} md={4} key={search.id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                        }
                      }}
                      onClick={() => loadSavedSearch(search)}
                      aria-label={`${search.name} 검색 불러오기`}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {search.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedSearch(search.id);
                          }}
                          aria-label="저장된 검색 삭제"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        마지막 사용: {search.lastUsed.toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
                {savedSearches.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">저장된 검색이 없습니다.</Alert>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 기본 검색 */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="basic-search" id="basic-search-header">
              <Typography>기본 검색</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="키워드"
                    value={filters.keyword}
                    onChange={(e) => updateFilter('keyword', e.target.value)}
                    placeholder="예: React, JavaScript, 프론트엔드"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="제외 키워드"
                    value={filters.excludeKeywords}
                    onChange={(e) => updateFilter('excludeKeywords', e.target.value)}
                    placeholder="예: 외주, 파견"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>직군</InputLabel>
                    <Select
                      value={filters.jobCategory}
                      label="직군"
                      onChange={(e) => updateFilter('jobCategory', e.target.value)}
                      inputProps={{ 'aria-label': '직군 선택' }}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">전체</MenuItem>
                      {OPTIONS.jobCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>경험수준</InputLabel>
                    <Select
                      value={filters.experienceLevel}
                      label="경험수준"
                      onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                      inputProps={{ 'aria-label': '경험수준 선택' }}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">전체</MenuItem>
                      {OPTIONS.experienceLevels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>지역</InputLabel>
                    <Select
                      value={filters.region}
                      label="지역"
                      onChange={(e) => updateFilter('region', e.target.value)}
                      inputProps={{ 'aria-label': '지역 선택' }}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">전체</MenuItem>
                      {OPTIONS.regions.map((region) => (
                        <MenuItem key={region} value={region}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 회사 정보 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="company-info" id="company-info-header">
              <Typography>회사 정보</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="회사명"
                    value={filters.companyName}
                    onChange={(e) => updateFilter('companyName', e.target.value)}
                    placeholder="예: 네이버, 카카오"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>회사 규모</InputLabel>
                    <Select
                      value={filters.companySize}
                      label="회사 규모"
                      onChange={(e) => updateFilter('companySize', e.target.value)}
                      inputProps={{ 'aria-label': '회사 규모 선택' }}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">전체</MenuItem>
                      {OPTIONS.companySizes.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>업계</InputLabel>
                    <Select
                      value={filters.industry}
                      label="업계"
                      onChange={(e) => updateFilter('industry', e.target.value)}
                      inputProps={{ 'aria-label': '업계 선택' }}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">전체</MenuItem>
                      {OPTIONS.industries.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 근무 조건 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="work-conditions" id="work-conditions-header">
              <Typography>근무 조건</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>근무 형태</InputLabel>
                    <Select
                      value={filters.workType}
                      label="근무 형태"
                      onChange={(e) => updateFilter('workType', e.target.value)}
                      inputProps={{ 'aria-label': '근무 형태 선택' }}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">전체</MenuItem>
                      {OPTIONS.workTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>게시 기간</InputLabel>
                    <Select
                      value={filters.postedWithin}
                      label="게시 기간"
                      onChange={(e) => updateFilter('postedWithin', e.target.value)}
                      inputProps={{ 'aria-label': '게시 기간 선택' }}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 } }}
                    >
                      {OPTIONS.postedWithinOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    연봉 범위: {filters.salary[0].toLocaleString()}만원 - {filters.salary[1].toLocaleString()}만원
                  </Typography>
                  <Slider
                    value={filters.salary}
                    onChange={(e, value) => updateFilter('salary', value)}
                    valueLabelDisplay="auto"
                    min={2000}
                    max={15000}
                    step={500}
                    marks={[
                      { value: 2000, label: '2000만원' },
                      { value: 5000, label: '5000만원' },
                      { value: 8000, label: '8000만원' },
                      { value: 12000, label: '1억2000만원' },
                      { value: 15000, label: '1억5000만원' },
                    ]}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 기술 스택 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>기술 스택 및 복리후생</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={OPTIONS.skills}
                    value={filters.skills}
                    onChange={(e, value) => updateFilter('skills', value)}
                    renderInput={(params) => (
                      <TextField {...params} label="요구 기술" placeholder="기술 선택" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          size="small"
                          {...getTagProps({ index })}
                          key={option}
                        />
                      ))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={OPTIONS.benefits}
                    value={filters.benefits}
                    onChange={(e, value) => updateFilter('benefits', value)}
                    renderInput={(params) => (
                      <TextField {...params} label="복리후생" placeholder="복리후생 선택" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          size="small"
                          {...getTagProps({ index })}
                          key={option}
                        />
                      ))
                    }
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 정렬 옵션 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="sort-options" id="sort-options-header">
              <Typography>정렬 및 기타 옵션</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>정렬 기준</InputLabel>
                    <Select
                      value={filters.sortBy}
                      label="정렬 기준"
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                      inputProps={{ 'aria-label': '정렬 기준 선택' }}
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 } }}
                    >
                      {OPTIONS.sortOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box>
            <Button
              startIcon={<ClearIcon />}
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
            >
              초기화
            </Button>
            <Button
              startIcon={<SaveIcon />}
              onClick={() => setShowSaveDialog(true)}
              disabled={activeFiltersCount === 0}
            >
              검색 저장
            </Button>
          </Box>
          <Box>
            <Button onClick={onClose}>
              취소
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ ml: 1 }}
            >
              검색 ({activeFiltersCount}개 필터)
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* 검색 저장 다이얼로그 */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>검색 조건 저장</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="검색 이름"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="예: React 신입 개발자"
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={saveSearch}
            disabled={!searchName.trim()}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdvancedSearch;