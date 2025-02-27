import React, { useState } from 'react';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DailyData {
  date: string;
  amount: number;
  totalAmount: number;
}

interface Violation {
  rule_title: string;
  group_name: string;
  count: number;
  amount: number;
}

interface BillingChartsProps {
  dailyData: DailyData[];
  violations: Violation[];
}

const COLORS = ['#06c9b3', '#039686', '#07776c', '#0b5f58', '#0c4e49'];

export function BillingCharts({ dailyData, violations }: BillingChartsProps) {
  const [activeChart, setActiveChart] = useState<'trend' | 'pie'>('trend');

  const pieData = violations.map(violation => ({
    name: violation.rule_title,
    value: violation.amount
  }));

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setActiveChart('trend')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeChart === 'trend'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>推移</span>
        </button>
        <button
          onClick={() => setActiveChart('pie')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeChart === 'pie'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <PieChartIcon className="w-5 h-5" />
          <span>内訳</span>
        </button>
      </div>

      <div className="h-64 w-full">
        {activeChart === 'trend' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06c9b3" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#06c9b3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `¥${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value: number) => [`¥${value.toLocaleString()}`, '罰金額']}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="totalAmount"
                stroke="#06c9b3"
                fill="url(#colorAmount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `¥${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}