interface ExperienceTypeBadgeProps {
  type?: 'standard' | 'itinerary' | 'one-time' | 'multi-day' | 'recurring';
  className?: string;
}

const LABEL: Record<string, string> = {
  standard: 'One Time Experience',
  itinerary: 'Itinerary',
  'one-time': 'One Time Experience',
  'multi-day': 'Multi-Day Experience',
  recurring: 'Recurring Experience',
};

export const ExperienceTypeBadge = ({
  type = 'standard',
  className = '',
}: ExperienceTypeBadgeProps) => (
  <div
    className={`rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm ${className} `}
  >
    {LABEL[type] ?? type}
  </div>
);
