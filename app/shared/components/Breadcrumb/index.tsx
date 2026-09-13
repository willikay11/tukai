import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';

export interface BreadcrumbItem {
  label: string;
  // Omit for the current page, or for an ancestor that has no page yet
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  // 'accent' renders ancestors in the brand colour and mutes the current page —
  // the treatment used above a page's own title (e.g. "Discover › Happening Today")
  variant?: 'default' | 'accent';
}

export const Breadcrumb = ({ items, className = '', variant = 'default' }: BreadcrumbProps) => {
  const isAccent = variant === 'accent';
  const linkClassName = isAccent
    ? 'font-medium text-primary hover:underline'
    : 'text-gray-500 hover:text-gray-700';

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const currentClassName = isAccent
            ? 'text-gray-400'
            : isLast
              ? 'font-medium text-gray-900'
              : 'text-gray-500';

          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && (
                <IconComponent
                  iconName="ArrowRight01Icon"
                  size={14}
                  color="currentColor"
                  className="text-gray-300"
                />
              )}

              {item.href ? (
                <Link href={item.href} className={linkClassName}>
                  {item.label}
                </Link>
              ) : (
                <span className={currentClassName} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
