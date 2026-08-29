"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF3482" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FF3482" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#9CA3AF' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#9CA3AF' }} 
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#FF3482', color: 'white', fontWeight: 'bold' }}
            itemStyle={{ color: 'white' }}
            cursor={{ stroke: '#FF3482', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#FF3482" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
