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

  const getCompanySizeColor = (size) => {
    switch (size) {
      case '대기업':
        return '#1976d2';
      case '중견기업':
        return '#4caf50';
      case '스타트업':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getCompanySizeIcon = (size) => {
    switch (size) {
      case '대기업':
        return '🏢';
      case '중견기업':
        return '🏬';
      case '스타트업':
        return '🚀';
      default:
        return '💼';
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: 200,
        border: '2px solid #333',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: hovered
          ? 'translateY(-4px) scale(1.02)'
          : 'translateY(0) scale(1)',
        borderColor: hovered ? '#1976d2' : '#333',
        boxShadow: hovered
          ? '0 8px 24px rgba(25,118,210,0.25)'
          : '0 2px 4px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
        '&:hover': {
          borderColor: '#1976d2',
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
          background: `linear-gradient(45deg, ${getCompanySizeColor(company.companySize)}20, transparent)`,
          borderRadius: '0 0 0 60px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        <Typography sx={{ fontSize: '16px' }}>
          {getCompanySizeIcon(company.companySize)}
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
                bgcolor: getCompanySizeColor(company.companySize),
                fontSize: '12px',
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
              {company.name}
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
            {company.position}
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
            {company.skills.slice(0, 3).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                variant="outlined"
                sx={{
                  border: '1.5px solid #1976d2',
                  color: '#1976d2',
                  fontSize: '11px',
                  fontWeight: 500,
                  height: '24px',
                  backgroundColor: hovered ? '#e3f2fd' : 'white',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                }}
              />
            ))}
            {company.skills.length > 3 && (
              <Chip
                label={`+${company.skills.length - 3}`}
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
              {company.region}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SalaryIcon sx={{ fontSize: 14, color: '#4caf50' }} />
            <Typography
              variant="caption"
              sx={{
                color: '#4caf50',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {company.experienceLevel}
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
                'linear-gradient(45deg, rgba(25,118,210,0.02) 0%, rgba(25,118,210,0.05) 100%)',
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
