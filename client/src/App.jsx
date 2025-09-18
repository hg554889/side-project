import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import AnalysisPage from './pages/AnalysisPage';
import DetailedAnalysisPage from './pages/DetailedAnalysisPage';
import TrendsPage from './pages/TrendsPage';
import AdminPage from './pages/AdminPage';
import ComparisonPage from './pages/ComparisonPage';
import JobDetailPage from './pages/JobDetailPage';
import LearningPathsPage from './pages/LearningPathsPage';

// Create custom MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#059669',
      light: '#34d399',
      dark: '#047857',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          fontSize: '0.95rem',
          textTransform: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
          '&:hover': {
            boxShadow: '0 8px 25px 0 rgba(37, 99, 235, 0.35)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.1rem',
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 16,
          border: '1px solid rgba(226, 232, 240, 0.8)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: 'rgba(203, 213, 225, 0.8)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(37, 99, 235, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 10,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Main App Content Component
const AppContent = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Skip to content for keyboard users */}
      <a href="#main" className="skip-link">본문으로 건너뛰기</a>

      {/* Global Header */}
      <Header />

      {/* Main Content Area */}
      <Box component="main" id="main" role="main" aria-label="메인 콘텐츠" sx={{ flex: 1, pb: { xs: 8, md: 4 } }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/analysis/:id" element={<DetailedAnalysisPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/learning-paths" element={<LearningPathsPage />} />
          {/* 추후 추가될 라우트들 */}
        </Routes>
      </Box>

      {/* Global Styles */}
      <style jsx global>{`
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Custom animations */
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Smooth focus transitions */
        *:focus-visible {
          outline: 2px solid #1976d2;
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Loading animation */
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Selection styles */
        ::selection {
          background-color: rgba(25, 118, 210, 0.2);
          color: inherit;
        }

        /* Mobile responsive utilities */
        @media (max-width: 600px) {
          .hide-on-mobile {
            display: none !important;
          }
        }

        @media (min-width: 901px) {
          .hide-on-desktop {
            display: none !important;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }
        }
      `}</style>
    </Box>
  );
};

// Root App Component
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
