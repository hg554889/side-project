import React, { useMemo } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Fab,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import SearchSection from '../components/SearchSection';
import CompanyCard from '../components/CompanyCard';
import { mockCompanies } from '../utils/mockData';

const MainPage = () => {
  const { state, actions } = useApp();

  // Filter companies based on search query and filters
  const filteredCompanies = useMemo(() => {
    return mockCompanies.filter((company) => {
      // Search query filter
      const matchesSearch =
        !state.searchQuery ||
        company.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        company.position
          .toLowerCase()
          .includes(state.searchQuery.toLowerCase()) ||
        company.skills.some((skill) =>
          skill.toLowerCase().includes(state.searchQuery.toLowerCase())
        );

      // Filter conditions
      const matchesExperience =
        !state.filters.experience ||
        company.experienceLevel === state.filters.experience;

      const matchesRegion =
        !state.filters.region || company.region === state.filters.region;

      const matchesCompanySize =
        !state.filters.companySize ||
        company.companySize === state.filters.companySize;

      return (
        matchesSearch &&
        matchesExperience &&
        matchesRegion &&
        matchesCompanySize
      );
    });
  }, [state.searchQuery, state.filters]);

  const handleCardClick = (company) => {
    console.log('Company card clicked:', company);
    // TODO: Implement company detail modal or navigation
  };

  const handleAnalysisNavigation = () => {
    actions.setPage('analysis');
  };

  const getActiveFilterCount = () => {
    return Object.values(state.filters).filter(Boolean).length;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section - Toss Style */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 6, md: 10 },
          mb: 6,
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          borderRadius: 4,
        }}
      >
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 3 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              color: '#0f172a',
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            채용공고 분석으로
            <br />
            <Typography
              component="span"
              sx={{
                color: '#2563eb',
                fontWeight: 800,
                fontSize: 'inherit',
              }}
            >
              취업 성공률
            </Typography>
            을 높이세요
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              mb: 6,
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            AI가 분석한 맞춤형 인사이트로 더 나은 커리어를 만들어가세요
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleAnalysisNavigation}
              sx={{
                px: 6,
                py: 2.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                boxShadow: 'none',
                minWidth: 200,
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease',
              }}
            >
              분석 시작하기
            </Button>

            <Button
              variant="text"
              size="large"
              startIcon={<TrendingUpIcon />}
              sx={{
                px: 4,
                py: 2.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
                color: '#64748b',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                },
                transition: 'all 0.2s ease',
              }}
            >
              트렌드 보기
            </Button>
          </Box>
        </Box>

        {/* Stats - Simplified */}
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 4, md: 8 },
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                mb: 1,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              12,000+
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontWeight: 500
              }}
            >
              분석된 채용공고
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                mb: 1,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              95%
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontWeight: 500
              }}
            >
              분석 정확도
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                mb: 1,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              7
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontWeight: 500
              }}
            >
              지원 직군
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search Section */}
      <SearchSection />

      {/* Company Cards Section - Clean Design */}
      <Box sx={{ mb: 6 }}>
        {/* Section Header - Simplified */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                mb: 1,
              }}
            >
              채용공고
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontWeight: 400,
              }}
            >
              {filteredCompanies.length}개의 채용공고
              {getActiveFilterCount() > 0 && (
                <Typography
                  component="span"
                  sx={{
                    ml: 1,
                    color: '#2563eb',
                    fontWeight: 500,
                  }}
                >
                  • {getActiveFilterCount()}개 필터 적용
                </Typography>
              )}
            </Typography>
          </Box>

          {getActiveFilterCount() > 0 && (
            <Button
              variant="text"
              size="small"
              onClick={() => {
                actions.setSearchQuery('');
                actions.setFilters({
                  experience: '',
                  region: '',
                  companySize: '',
                });
              }}
              sx={{
                color: '#64748b',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
              }}
            >
              필터 초기화
            </Button>
          )}
        </Box>

        {/* Cards Grid Container - Clean */}
        {filteredCompanies.length > 0 ? (
          <Grid container spacing={3}>
            {filteredCompanies.map((company) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
                <CompanyCard company={company} onClick={handleCardClick} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 12,
              px: 4,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              검색 결과가 없습니다
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#94a3b8',
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              다른 검색어를 입력하거나 필터 조건을 변경해 보세요
            </Typography>
          </Box>
        )}
      </Box>

      {/* Floating Action Button - Simplified */}
      <Fab
        color="primary"
        onClick={handleAnalysisNavigation}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#2563eb',
          color: 'white',
          boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
          '&:hover': {
            backgroundColor: '#1d4ed8',
            boxShadow: '0 8px 25px 0 rgba(37, 99, 235, 0.35)',
          },
          transition: 'all 0.2s ease',
          zIndex: 1000,
        }}
      >
        <AnalyticsIcon />
      </Fab>

      {/* Mobile Bottom Bar - Clean */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          p: 3,
          zIndex: 999,
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 'sm',
            mx: 'auto',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            {filteredCompanies.length}개 채용공고
          </Typography>
          <Button
            variant="contained"
            onClick={handleAnalysisNavigation}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              backgroundColor: '#2563eb',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#1d4ed8',
                boxShadow: 'none',
              },
            }}
          >
            분석하기
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default MainPage;
