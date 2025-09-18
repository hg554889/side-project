import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  Tab,
  Tabs,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Whatshot as WhatshotIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { SkillMapAPI } from '../services/api';

const TrendsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [marketOverview, setMarketOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true);
        const [skillsData, marketData] = await Promise.all([
          SkillMapAPI.getTrendingSkills(),
          SkillMapAPI.getMarketOverview(),
        ]);
        setTrendingSkills(skillsData);
        setMarketOverview(marketData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'hot':
        return <WhatshotIcon sx={{ color: '#ff5722' }} />;
      case 'rising':
        return <TrendingUpIcon sx={{ color: '#4caf50' }} />;
      case 'stable':
        return <RemoveIcon sx={{ color: '#757575' }} />;
      case 'declining':
        return <ArrowDownwardIcon sx={{ color: '#f44336' }} />;
      default:
        return <RemoveIcon sx={{ color: '#757575' }} />;
    }
  };

  const getTrendChip = (growth) => {
    const value = parseInt(growth.replace('%', '').replace('+', ''));
    if (value >= 30) {
      return <Chip label={growth} color="error" size="small" icon={<ArrowUpwardIcon />} />;
    } else if (value >= 15) {
      return <Chip label={growth} color="warning" size="small" icon={<ArrowUpwardIcon />} />;
    } else if (value >= 5) {
      return <Chip label={growth} color="success" size="small" icon={<ArrowUpwardIcon />} />;
    } else {
      return <Chip label={growth} color="default" size="small" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
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
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          시장 트렌드 분석
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          실시간 채용 시장 동향과 인기 스킬을 확인하세요
        </Typography>

        {/* Market Overview Cards */}
        {marketOverview && (
          <Grid container spacing={2} sx={{ mb: 4 }} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {marketOverview.totalJobs.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  총 채용공고
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                  {marketOverview.growthRate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  성장률 (전월 대비)
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                  {marketOverview.hotSkills.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  핫 스킬
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                  {marketOverview.emergingRoles.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  신규 직무
                </Typography>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '.MuiTabs-flexContainer': { justifyContent: 'center' } }}
        >
          <Tab
            label="인기 스킬"
            icon={<WhatshotIcon />}
            iconPosition="start"
          />
          <Tab
            label="시장 동향"
            icon={<TrendingUpIcon />}
            iconPosition="start"
          />
          <Tab
            label="신규 직무"
            icon={<WorkIcon />}
            iconPosition="start"
          />
          <Tab
            label="Top 기업"
            icon={<BusinessIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WhatshotIcon color="primary" />
                  인기 스킬 랭킹
                </Typography>
                <List>
                  {trendingSkills.map((skill, index) => (
                    <React.Fragment key={skill.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: index < 3 ? 'primary.main' : 'grey.300',
                              fontWeight: 'bold',
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" component="span">
                                {skill.name}
                              </Typography>
                              {getTrendIcon(skill.trend)}
                              <Chip
                                label={skill.category}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {skill.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Typography variant="body2">
                                  평균 연봉: <strong>{skill.avgSalary}</strong>
                                </Typography>
                                <Typography variant="body2">
                                  채용공고: <strong>{skill.jobCount}개</strong>
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {getTrendChip(skill.demandGrowth)}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < trendingSkills.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  스킬 학습 가이드
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  인기 스킬을 효과적으로 학습할 수 있는 방법을 제공합니다.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/learning-paths')}
                >
                  학습 경로 보기
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  💡 인사이트
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>React</strong>와 <strong>TypeScript</strong>의 조합이
                    가장 높은 연봉을 제공하고 있습니다.
                  </Typography>
                </Alert>
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>AI/ML</strong> 관련 스킬의 수요가 급증하고 있어
                    학습하기 좋은 시점입니다.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && marketOverview && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  급성장 스킬
                </Typography>
                <List>
                  {marketOverview.hotSkills.map((skill, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={skill.name}
                        secondary={`성장률: ${skill.growth}`}
                      />
                      <ListItemSecondaryAction>
                        {getTrendChip(skill.growth)}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  시장 분석
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>전체 채용공고:</strong> {marketOverview.totalJobs.toLocaleString()}개
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>성장률:</strong> {marketOverview.growthRate} (전월 대비)
                  </Typography>
                  <Typography variant="body1">
                    <strong>분석:</strong> IT 업계의 지속적인 성장으로 개발자 수요가
                    꾸준히 증가하고 있습니다.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  fullWidth
                  onClick={() => navigate('/analysis')}
                >
                  상세 분석 받기
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && marketOverview && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  주목해야 할 신규 직무
                </Typography>
                <Grid container spacing={2}>
                  {marketOverview.emergingRoles.map((role, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <WorkIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {role}
                        </Typography>
                        <Chip
                          label="신규"
                          color="warning"
                          size="small"
                          icon={<StarIcon />}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && marketOverview && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  채용 활동이 활발한 Top 기업
                </Typography>
                <List>
                  {marketOverview.topCompanies.map((company, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: index < 3 ? 'primary.main' : 'grey.300',
                              fontWeight: 'bold',
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={company.name}
                          secondary={`${company.openings}개의 채용공고`}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/?company=${company.name}`)}
                          >
                            채용공고 보기
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < marketOverview.topCompanies.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Buttons */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<TrendingUpIcon />}
              onClick={() => navigate('/analysis')}
            >
              내 분야 분석하기
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
        </Grid>
      </Box>
    </Container>
  );
};

export default TrendsPage;