import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

const SkillDemandChart = ({ data = [], title = "스킬 요구도 분석" }) => {
  // 색상 팔레트
  const colors = [
    '#2563eb', '#059669', '#f59e0b', '#ef4444', '#7c3aed',
    '#06b6d4', '#84cc16', '#f97316', '#dc2626', '#0ea5e9'
  ];

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            p: 1.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#0f172a' }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value}%
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 12,
                right: 16,
                left: 8,
                bottom: 8,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#475569' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#475569' }}
                label={{ value: '요구도 (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkillDemandChart;