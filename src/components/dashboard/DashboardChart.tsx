"use strict";
"use client";

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartData {
  rawDate?: string;
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
}

export function DashboardChart({ data, currency = 'USD' }: { data: ChartData[], currency?: string }) {
  const [period, setPeriod] = useState("mes");

  const filteredData = useMemo(() => {
    if (period === "semana") {
      if (data.length === 0) return [];
      const latestDateStr = data[data.length - 1].rawDate;
      if (!latestDateStr) return data.slice(-7);
      
      const latestDate = new Date(latestDateStr).getTime();
      const sevenDaysAgo = latestDate - (7 * 24 * 60 * 60 * 1000);
      
      return data.filter(d => {
        if (!d.rawDate) return true;
        return new Date(d.rawDate).getTime() >= sevenDaysAgo;
      });
    } else if (period === "mes") {
      const grouped = data.reduce((acc: any, curr) => {
        if (!curr.rawDate) return acc;
        const d = new Date(curr.rawDate);
        const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
        if (!acc[yearMonth]) {
          const monthName = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d);
          const fullMonthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d);
          acc[yearMonth] = {
            rawDate: curr.rawDate,
            dayLabel: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            fullDate: fullMonthName.charAt(0).toUpperCase() + fullMonthName.slice(1),
            amount: 0,
            sortKey: d.getTime()
          };
        }
        acc[yearMonth].amount += curr.amount;
        return acc;
      }, {});
      
      const result = Object.values(grouped).sort((a: any, b: any) => a.sortKey - b.sortKey);
      return result.length > 0 ? result as ChartData[] : data;
    }
    return data;
  }, [data, period]);

  return (
    <div className="w-full flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 hidden md:block">Gastos Actuales</h2>
        <h2 className="text-xl font-bold text-gray-900 block md:hidden">Evolución de Gastos</h2>
        <Select value={period} onValueChange={(val) => val && setPeriod(val)}>
          <SelectTrigger className="w-[140px] h-8 text-xs font-semibold bg-white border-gray-200 rounded-lg focus:ring-brand/30 focus:border-brand transition-colors text-gray-700 shadow-sm">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-gray-100">
            <SelectItem value="mes" className="cursor-pointer text-sm font-medium focus:bg-brand/10 focus:text-brand transition-colors">Por Meses</SelectItem>
            <SelectItem value="semana" className="cursor-pointer text-sm font-medium focus:bg-brand/10 focus:text-brand transition-colors">Últimos 7 días</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full flex-1 relative mt-2 min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <>
          {/* Desktop Area Chart */}
          <div className="hidden md:block w-full h-full absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === filteredData.length - 1 ? '#FF3482' : '#FFEAEE'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
