import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
} from '@mui/icons-material';

const CompanyCard = ({ company, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    // 채용공고 상세 페이지로 이동
    navigate(`/jobs/${company.id}`);

    if (onClick) {
      onClick(company);
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'saramin':
        return '#4CAF50';
      case 'worknet':
        return '#2196F3';
      case 'comento':
        return '#FF9800';
      case 'securityfarm':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'saramin':
        return '💼';
      case 'worknet':
        return '🏛️';
      case 'comento':
        return '🎓';
      case 'securityfarm':
        return '🔒';
      default:
        return '📝';
    }
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return '협의';
    return salaryRange;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: 200,
        border: '1px solid var(--border-color)',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        borderColor: hovered ? 'var(--primary-color)' : 'var(--border-color)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.08)' : '0 2px 6px rgba(0,0,0,0.04)',
        backgroundColor: 'white',
        '&:hover': {
          borderColor: 'var(--primary-color)',
        },
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          background: `linear-gradient(45deg, ${getSourceColor(company.source_site)}20, transparent)`,
          borderRadius: '0 0 0 60px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        <Typography sx={{ fontSize: '16px' }}>
          {getSourceIcon(company.source_site)}
        </Typography>
      </Box>

      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2.5,
          '&:last-child': { pb: 2.5 },
        }}
      >
        {/* Header Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: getSourceColor(company.source_site),
                fontSize: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <BusinessIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '18px',
                color: '#333',
                lineHeight: 1.2,
              }}
            >
              {company.company}
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: '#666',
              mb: 1.5,
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: 1.3,
            }}
          >
            {company.title}
          </Typography>
        </Box>

        {/* Skills Section */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
              maxHeight: '50px',
              overflow: 'hidden',
            }}
          >
            {(company.tags || []).slice(0, 3).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                variant="outlined"
                sx={{
                  border: '1px solid var(--primary-color)',
                  color: 'var(--primary-color)',
                  fontSize: '11px',
                  fontWeight: 500,
                  height: '24px',
                  backgroundColor: hovered ? '#eaf3ff' : 'white',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#eaf3ff',
                  },
                }}
              />
            ))}
            {(company.tags || []).length > 3 && (
              <Chip
                label={`+${(company.tags || []).length - 3}`}
                size="small"
                variant="filled"
                sx={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  fontSize: '11px',
                  fontWeight: 500,
                  height: '24px',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Footer Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 1,
            borderTop: hovered ? '1px solid #e3f2fd' : '1px solid #f0f0f0',
            transition: 'border-color 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationIcon sx={{ fontSize: 14, color: '#888' }} />
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {company.location || '지역미상'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SalaryIcon sx={{ fontSize: 14, color: 'var(--secondary-color)' }} />
            <Typography
              variant="caption"
              sx={{
                color: 'var(--secondary-color)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {formatSalary(company.salary)}
            </Typography>
          </Box>
        </Box>

        {/* Hover Overlay */}
        {hovered && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(45deg, rgba(25,118,210,0.03) 0%, rgba(25,118,210,0.06) 100%)',
              pointerEvents: 'none',
              borderRadius: 1,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
