import { IconComponent } from '@/app/shared/components/Icons';

interface StudioStatCardProps {
  icon: string;
  value: string;
  label: string;
  delta: string;
  deltaTone?: 'positive' | 'negative';
  // Tailwind colour family shared by the top rule, icon tile and the bars
  tone: { rule: string; tile: string; icon: string; bars: string[] };
}

export const StudioStatCard = ({
  icon,
  value,
  label,
  delta,
  deltaTone = 'positive',
  tone,
}: StudioStatCardProps) => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className={`h-1 w-full ${tone.rule}`} />

    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.tile}`}>
          <IconComponent iconName={icon} size={18} color="currentColor" className={tone.icon} />
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            deltaTone === 'negative' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'
          }`}
        >
          {delta}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>

      {/* ⚠️ Decorative: no time-series endpoint backs these bars */}
      <div className="mt-4 flex items-end gap-1.5" aria-hidden="true">
        {tone.bars.map((bar, index) => (
          <span
            key={index}
            className={`h-4 flex-1 rounded-sm ${bar}`}
            style={{ height: `${10 + index * 2}px` }}
          />
        ))}
      </div>
    </div>
  </div>
);
