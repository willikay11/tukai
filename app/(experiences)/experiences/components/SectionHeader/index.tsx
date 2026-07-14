import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
}

export const SectionHeader = ({ title, subtitle, seeAllHref }: SectionHeaderProps) => (
  <div className="mb-4 flex items-end justify-between">
    <div className="flex items-baseline gap-2">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
    </div>
    {seeAllHref && (
      <Link
        href={seeAllHref}
        className="flex-shrink-0 text-sm font-medium text-primary hover:underline"
      >
        See all
      </Link>
    )}
  </div>
);
