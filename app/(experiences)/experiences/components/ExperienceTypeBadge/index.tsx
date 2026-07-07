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

export const ExperienceTypeBadge = ({ type = 'standard', className = '' }: ExperienceTypeBadgeProps) => (
  <div
    className={`
      bg-black/60 backdrop-blur-sm text-white text-sm
      font-medium px-4 py-1.5 rounded-full
      ${className}
    `}
  >
    {LABEL[type] ?? type}
  </div>
);
