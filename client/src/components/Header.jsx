import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Work as WorkIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

const Header = () => {
  const { actions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { label: '홈', path: '/' },
    { label: '분석', path: '/analysis' },
    { label: '트렌드', path: '/trends' },
    { label: '비교', path: '/compare' },
    { label: 'AI 챗봇', path: '/chat' }, // Added navigation item for ChatPage
  ];

  const handleNavigate = (path) => {
    navigate(path);
    actions.clearError();
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

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
              onClick={() => handleNavigate('/')}
              role="button"
              aria-label="홈으로 이동"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleNavigate('/');
              }}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(37,99,235,0.25)',
                cursor: 'pointer',
              }}
            >
              <WorkIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography
              variant="h5"
              onClick={() => handleNavigate('/')}
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                cursor: 'pointer',
              }}
            >
              SkillMap
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'contained' : 'text'}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '15px',
                  backgroundColor: isActive(item.path)
                    ? 'var(--primary-color)'
                    : 'transparent',
                  color: isActive(item.path) ? 'white' : '#64748b',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: isActive(item.path)
                      ? '#1d4ed8'
                      : '#f1f5f9',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Mobile menu button */}
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#64748b' }}
            aria-label="메뉴 열기"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            borderLeft: '1px solid #e2e8f0',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <WorkIcon sx={{ color: 'var(--primary-color)' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              SkillMap
            </Typography>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={isActive(item.path)}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(37,99,235,0.08)',
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive(item.path) ? 700 : 500,
                      color: isActive(item.path)
                        ? 'var(--primary-color)'
                        : '#334155',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;
