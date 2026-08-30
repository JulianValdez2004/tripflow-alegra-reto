"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ChartData {
  dayLabel: string;
  fullDate: string;
  amount: number;
}

const CustomTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#FF3482] text-white p-3 rounded-xl shadow-lg border-none outline-none z-50">
        <p className="text-xs font-semibold mb-1 opacity-90 capitalize">{data.fullDate}</p>
        <p className="text-lg font-black tracking-tight">
          {formatCurrency(data.amount, currency)}
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardChart({ data, currency = 'USD' }: { data: ChartData[], currency?: string }) {
  return (
    <div className="w-full h-full min-h-[250px] relative mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <>
          {/* Desktop Area Chart */}
          <div className="hidden md:block w-full h-full absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3482" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF3482" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="dayLabel" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  width={65}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                    return `$${value}`;
                  }}
                />
                <Tooltip cursor={{ stroke: '#FF3482', strokeWidth: 1, strokeDasharray: '4 4' }} content={(props: any) => <CustomTooltip {...props} currency={currency} />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#FF3482" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  activeDot={{ r: 6, fill: "#FF3482", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Mobile Bar Chart */}
          <div className="block md:hidden w-full h-full absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="dayLabel" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  width={55}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                    return `$${value}`;
                  }}
                />
                <Tooltip cursor={{ fill: '#F3F4F6' }} content={(props: any) => <CustomTooltip {...props} currency={currency} />} />
                <Bar 
                  dataKey="amount" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#FF3482' : '#FFEAEE'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      </ResponsiveContainer>
    </div>
  );
}
