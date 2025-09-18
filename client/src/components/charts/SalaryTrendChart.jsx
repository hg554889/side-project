import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

const SalaryTrendChart = ({ data = [], title = "연봉 트렌드 분석", type = "line" }) => {
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
              {entry.name}: {entry.value.toLocaleString()}만원
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  // 차트 타입에 따른 렌더링
  const renderChart = () => {
    if (type === "area") {
      return (
        <AreaChart
          data={data}
          margin={{
            top: 12,
            right: 16,
            left: 8,
            bottom: 8,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis
            tick={{ fontSize: 12, fill: '#475569' }}
            label={{ value: '연봉 (만원)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="min"
            stackId="1"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.15}
            name="최소 연봉"
          />
          <Area
            type="monotone"
            dataKey="max"
            stackId="1"
            stroke="#059669"
            fill="#059669"
            fillOpacity={0.15}
            name="최대 연봉"
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            name="평균 연봉"
          />
        </AreaChart>
      );
    }

    return (
      <LineChart
        data={data}
        margin={{
          top: 12,
          right: 16,
          left: 8,
          bottom: 8,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
        <YAxis
          tick={{ fontSize: 12, fill: '#475569' }}
          label={{ value: '연봉 (만원)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="min"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
          name="최소 연봉"
        />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="#059669"
          strokeWidth={3}
          dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
          name="평균 연봉"
        />
        <Line
          type="monotone"
          dataKey="max"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
          name="최대 연봉"
        />
      </LineChart>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#0f172a' }}>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalaryTrendChart;