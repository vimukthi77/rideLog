'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DailyRidesChartProps {
  data: Array<{ day: number; dateStr: string; rides: number; km: number }>;
}

export default function DailyRidesChart({ data }: DailyRidesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#7F8C8D]">
        No trend data available for current month.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 20, left: -20, bottom: 10 }}>
          <defs>
            <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3282B8" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#BBE1FA" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#7F8C8D', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#7F8C8D', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1B262C',
              borderColor: '#3282B8',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
            formatter={(val: any, name: any, item: any) => [
              `${val} trips (${item.payload.km} KM)`,
              'Rides Completed',
            ]}
            labelFormatter={(label: any) => `Day ${label} of current month`}
          />
          <Area
            type="monotone"
            dataKey="rides"
            stroke="#3282B8"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRides)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
