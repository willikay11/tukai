'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';

interface RevenueChartProps {
  data: { month: string; amount: number }[];
  currency: string;
}

export const RevenueChart = ({ data, currency }: RevenueChartProps) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Revenue</h2>
        <p className="mt-0.5 text-sm text-gray-400">
          Last {data.length} months &middot; {currency}
        </p>
      </div>

      {/* ⚠️ No per-period revenue endpoint, so the range cannot be changed yet */}
      <span className="flex-shrink-0 rounded-full bg-gray-50 px-4 py-2 text-sm text-gray-500">
        Monthly
      </span>
    </div>

    <div className="mt-6 h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              // The latest month is emphasised, as in the design
              <Cell key={entry.month} fill={index === data.length - 1 ? '#84CC16' : '#A7D7C0'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
