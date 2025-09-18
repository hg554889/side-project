import React from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Work as WorkIcon } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

const Header = () => {
  const { state, actions } = useApp();

  const handleNavigate = (page) => {
    actions.setPage(page);
    actions.clearError();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WorkIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              SkillMap
            </Typography>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={state.currentPage === 'main' ? 'contained' : 'text'}
              onClick={() => handleNavigate('main')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '15px',
                backgroundColor:
                  state.currentPage === 'main' ? '#2563eb' : 'transparent',
                color: state.currentPage === 'main' ? 'white' : '#64748b',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor:
                    state.currentPage === 'main' ? '#1d4ed8' : '#f1f5f9',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease',
              }}
            >
              홈
            </Button>
            <Button
              variant={state.currentPage === 'analysis' ? 'contained' : 'text'}
              onClick={() => handleNavigate('analysis')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '15px',
                backgroundColor:
                  state.currentPage === 'analysis' ? '#2563eb' : 'transparent',
                color: state.currentPage === 'analysis' ? 'white' : '#64748b',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor:
                    state.currentPage === 'analysis' ? '#1d4ed8' : '#f1f5f9',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s ease',
              }}
            >
              분석
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
