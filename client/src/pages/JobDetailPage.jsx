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
  Divider,
  Alert,
  Skeleton,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Work as WorkIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { SkillMapAPI } from '../services/api';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [applicationDialog, setApplicationDialog] = useState(false);

  // 크롤링 데이터를 화면에 표시할 형태로 변환하는 함수
  const transformCrawledDataToJobDetail = (crawledData) => {
    const parseRequirements = (requirements) => {
      if (!requirements) return [];
      return requirements.split('\n').filter(req => req.trim().length > 0);
    };

    const parseBenefits = (benefits) => {
      if (!benefits) return [];
      return benefits.split('\n').filter(benefit => benefit.trim().length > 0);
    };

    const parseSalaryRange = (salaryRange) => {
      if (!salaryRange) return { min: 0, max: 0, negotiable: true };

      const match = salaryRange.match(/(\d+)-(\d+)/);
      if (match) {
        return {
          min: parseInt(match[1]),
          max: parseInt(match[2]),
          negotiable: true
        };
      }
      return { min: 0, max: 0, negotiable: true };
    };

    const salary = parseSalaryRange(crawledData.salary_range);

    return {
      id: crawledData.id,
      company: {
        name: crawledData.company_name,
        logo: '/logos/default.png',
        size: '기업',
        industry: crawledData.job_category || 'IT서비스',
        foundedYear: 2000,
        employees: '정보 없음',
        website: crawledData.source_url || '#',
      },
      position: crawledData.title,
      department: '개발팀',
      location: crawledData.work_location || '위치 미상',
      workType: '정규직',
      experience: crawledData.experience_level || '경력무관',
      education: '학사 이상',
      salary: {
        min: salary.min,
        max: salary.max,
        negotiable: salary.negotiable,
        benefits: crawledData.salary_range ? [crawledData.salary_range] : ['협의 후 결정'],
      },
      skills: {
        required: crawledData.keywords ? crawledData.keywords.slice(0, 4) : [],
        preferred: crawledData.keywords ? crawledData.keywords.slice(4, 8) : [],
        tools: ['Git', 'IDE', 'Browser'],
      },
      responsibilities: crawledData.description ?
        [crawledData.description] :
        ['채용공고 상세 업무 내용을 확인해 주세요.'],
      requirements: parseRequirements(crawledData.requirements),
      benefits: parseBenefits(crawledData.benefits),
      culture: ['협업 중시', '성장 지향', '워라밸'],
      applicationProcess: ['서류전형', '면접', '최종합격'],
      postedDate: crawledData.scraped_at ? new Date(crawledData.scraped_at).toISOString().split('T')[0] : '2024-01-15',
      deadline: '2024-12-31', // 기본 마감일
      views: Math.floor(Math.random() * 2000) + 100,
      applicants: Math.floor(Math.random() * 100) + 10,
    };
  };

  // Mock 상세 채용공고 데이터
  const mockJobDetail = {
    id: parseInt(id),
    company: {
      name: '네이버',
      logo: '/logos/naver.png',
      size: '대기업',
      industry: 'IT서비스',
      foundedYear: 1999,
      employees: '3,000+',
      website: 'https://www.navercorp.com',
    },
    position: '시니어 프론트엔드 개발자',
    department: '서비스개발본부',
    location: '경기도 성남시 분당구',
    workType: '정규직',
    experience: '3-5년차',
    education: '학사 이상',
    salary: {
      min: 5500,
      max: 7500,
      negotiable: true,
      benefits: ['성과급', '스톡옵션', '복지포인트 연 300만원'],
    },
    skills: {
      required: ['JavaScript', 'React', 'TypeScript', 'HTML/CSS'],
      preferred: ['Next.js', 'Redux', 'Webpack', 'Jest', 'Git'],
      tools: ['VS Code', 'Figma', 'Jira', 'Confluence'],
    },
    responsibilities: [
      'React 기반 웹 서비스 프론트엔드 개발',
      '사용자 경험 최적화 및 성능 개선',
      '백엔드 개발팀과의 API 연동 작업',
      '코드 리뷰 및 기술 문서 작성',
      '신기술 도입 및 개발 프로세스 개선',
    ],
    requirements: [
      'JavaScript, React에 대한 깊은 이해',
      'RESTful API 연동 경험',
      '반응형 웹 개발 경험',
      '협업 툴 사용 경험 (Git, Jira 등)',
      '문제 해결 능력 및 적극적인 커뮤니케이션',
    ],
    benefits: [
      '4대보험 + 퇴직연금',
      '연차 15일 + 리프레시 휴가',
      '교육비 지원 (연 200만원)',
      '건강검진 + 의료비 지원',
      '식사 지원 + 간식 제공',
      '자유로운 근무 환경',
      '재택근무 가능',
    ],
    culture: [
      '수평적 조직문화',
      '자율적 근무시간',
      '개발자 친화적 환경',
      '지속적인 학습 지원',
    ],
    applicationProcess: [
      '서류전형',
      '1차 기술면접',
      '2차 실무면접',
      '최종면접',
    ],
    postedDate: '2024-01-15',
    deadline: '2024-02-15',
    views: 1247,
    applicants: 89,
  };

  const mockSimilarJobs = [
    {
      id: 101,
      company: '카카오',
      position: '프론트엔드 개발자',
      location: '서울',
      salary: '4500-6500만원',
      skills: ['React', 'TypeScript', 'Next.js'],
      postedDate: '2024-01-12',
    },
    {
      id: 102,
      company: '토스',
      position: 'React 개발자',
      location: '서울',
      salary: '5000-7000만원',
      skills: ['React', 'JavaScript', 'GraphQL'],
      postedDate: '2024-01-10',
    },
    {
      id: 103,
      company: '라인',
      position: 'Frontend Engineer',
      location: '서울',
      salary: '협의 후 결정',
      skills: ['Vue.js', 'React', 'TypeScript'],
      postedDate: '2024-01-08',
    },
  ];

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);

        // 실제 API 호출
        const [jobDetail, allJobs] = await Promise.all([
          SkillMapAPI.getJobDetail(id),
          SkillMapAPI.getJobs({ limit: 10 })
        ]);

        if (jobDetail) {
          // 크롤링 데이터를 화면에 표시할 형태로 변환
          const transformedJobData = transformCrawledDataToJobDetail(jobDetail);
          setJobData(transformedJobData);

          // 유사한 채용공고 찾기 (같은 키워드를 가진 채용공고들)
          const similar = allJobs
            .filter(job =>
              job.id !== id &&
              job.keywords &&
              jobDetail.keywords &&
              job.keywords.some(keyword => jobDetail.keywords.includes(keyword))
            )
            .slice(0, 3)
            .map(job => ({
              id: job.id,
              company: job.company_name,
              position: job.title,
              location: job.work_location || '위치 미상',
              salary: job.salary_range || '협의',
              skills: job.keywords ? job.keywords.slice(0, 3) : [],
              postedDate: job.scraped_at
            }));

          setSimilarJobs(similar);
        } else {
          setError('채용공고를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('Error fetching job detail:', err);
        // 에러 시 목 데이터로 폴백
        setJobData(mockJobDetail);
        setSimilarJobs(mockSimilarJobs);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleApplication = () => {
    setApplicationDialog(true);
  };

  const getSkillLevel = (skill) => {
    const requiredSkills = jobData?.skills?.required || [];
    const preferredSkills = jobData?.skills?.preferred || [];

    if (requiredSkills.includes(skill)) {
      return { level: 'Required', color: 'error' };
    } else if (preferredSkills.includes(skill)) {
      return { level: 'Preferred', color: 'warning' };
    }
    return { level: 'Nice to have', color: 'info' };
  };

  const getDaysLeft = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  if (error || !jobData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || '채용공고를 찾을 수 없습니다.'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          목록으로 돌아가기
        </Button>
      </Container>
    );
  }

  const daysLeft = getDaysLeft(jobData.deadline);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {jobData.position}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
            {jobData.company.name} • {jobData.department}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleBookmark} color="primary">
            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          <IconButton color="primary">
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Info & Action Buttons */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="action" />
                  <Typography variant="body2">{jobData.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="action" />
                  <Typography variant="body2">
                    {jobData.salary.min.toLocaleString()}-{jobData.salary.max.toLocaleString()}만원
                    {jobData.salary.negotiable && ' (협의가능)'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon color="action" />
                  <Typography variant="body2">{jobData.experience}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="action" />
                  <Typography variant="body2">{jobData.workType}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  조회 {jobData.views}회 • 지원 {jobData.applicants}명
                </Typography>
                <Chip
                  label={daysLeft > 0 ? `${daysLeft}일 남음` : '마감'}
                  color={daysLeft > 7 ? 'success' : daysLeft > 3 ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'row', md: 'column' } }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleApplication}
                  disabled={daysLeft <= 0}
                >
                  지원하기
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/analysis')}
                >
                  역량 분석
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Job Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon color="primary" />
                주요 업무
              </Typography>
              <List>
                {jobData.responsibilities.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="primary" />
                자격 요건
              </Typography>
              <List>
                {jobData.requirements.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Skills Required */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                요구 기술
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.main' }}>
                필수 기술
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {jobData.skills.required.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'warning.main' }}>
                우대 기술
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {jobData.skills.preferred.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="warning"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'info.main' }}>
                사용 도구
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {jobData.skills.tools.map((tool) => (
                  <Chip
                    key={tool}
                    label={tool}
                    color="info"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="primary" />
                복리후생
              </Typography>
              <Grid container spacing={2}>
                {jobData.benefits.map((benefit, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{benefit}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Company Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" />
                회사 정보
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}
                >
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {jobData.company.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {jobData.company.industry}
                  </Typography>
                </Box>
              </Box>

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>규모</strong></TableCell>
                    <TableCell>{jobData.company.size}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>설립</strong></TableCell>
                    <TableCell>{jobData.company.foundedYear}년</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>직원수</strong></TableCell>
                    <TableCell>{jobData.company.employees}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  회사 문화
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {jobData.culture.map((culture) => (
                    <Chip
                      key={culture}
                      label={culture}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Application Process */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                전형 과정
              </Typography>
              {jobData.applicationProcess.map((step, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: 'primary.main',
                      fontSize: '0.75rem',
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Typography variant="body2">{step}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                유사한 채용공고
              </Typography>
              {similarJobs.map((job) => (
                <Paper
                  key={job.id}
                  sx={{ p: 2, mb: 2, cursor: 'pointer' }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {job.position}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {job.company} • {job.location}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                    {job.salary}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {job.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Application Dialog */}
      <Dialog
        open={applicationDialog}
        onClose={() => setApplicationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>지원하기</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            실제 지원은 해당 회사의 채용 페이지에서 진행하시기 바랍니다.
          </Alert>
          <Typography variant="body1">
            <strong>{jobData.company.name}</strong>의 <strong>{jobData.position}</strong>
            포지션에 관심을 가져주셔서 감사합니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicationDialog(false)}>
            닫기
          </Button>
          <Button
            variant="contained"
            href={jobData.company.website}
            target="_blank"
          >
            회사 사이트로 이동
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetailPage;