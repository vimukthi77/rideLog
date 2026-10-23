'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface VehicleKMChartProps {
  data: Array<{ name: string; shortName: string; km: number; trips: number }>;
}

export default function VehicleKMChart({ data }: VehicleKMChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#7F8C8D]">
        No vehicle activity recorded this month.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="shortName"
            tick={{ fill: '#1B262C', fontSize: 11, fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            tick={{ fill: '#7F8C8D', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit=" km"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1B262C',
              borderColor: '#3282B8',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${value} KM`, 'Distance']}
            labelFormatter={(label: any) => `Vehicle: ${label}`}
          />
          <Bar
            dataKey="km"
            fill="#3282B8"
            radius={[6, 6, 0, 0]}
            background={{ fill: '#BBE1FA', opacity: 0.25, radius: 6 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
