'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface VehicleUsagePieChartProps {
  data: Array<{ name: string; value: number; percent: number }>;
}

const COLORS = ['#0F4C75', '#3282B8', '#1B262C', '#27AE60', '#F39C12', '#8E44AD'];

export default function VehicleUsagePieChart({ data }: VehicleUsagePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#7F8C8D]">
        No vehicle distribution data.
      </div>
    );
  }

  return (
    <div className="h-72 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1B262C',
              borderColor: '#3282B8',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any, item: any) => [
              `${value} KM (${item.payload.percent || 0}%)`,
              item.payload.name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs font-semibold text-[#1B262C]">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
