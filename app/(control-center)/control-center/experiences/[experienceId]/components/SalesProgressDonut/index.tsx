'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface SalesProgressDonutProps {
  sold: number;
  total: number;
  percent: number;
}

// Tailwind tokens are not available inside the SVG recharts renders
const SOLD_COLOR = '#047857';
const REMAINING_COLOR = '#E5E7EB';

export const SalesProgressDonut = ({ sold, total, percent }: SalesProgressDonutProps) => {
  const remaining = Math.max(total - sold, 0);

  // A zero-everything chart renders nothing, so show a full ring of "remaining"
  const data =
    sold === 0 && remaining === 0
      ? [{ name: 'remaining', value: 1 }]
      : [
          { name: 'sold', value: sold },
          { name: 'remaining', value: remaining },
        ];

  return (
    <div className="relative h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={62}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.name === 'sold' ? SOLD_COLOR : REMAINING_COLOR} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Centre label — recharts has no built-in centre content for a donut */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-gray-900">{percent}%</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {sold} / {total} sold
        </p>
      </div>
    </div>
  );
};
