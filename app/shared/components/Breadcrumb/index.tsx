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
}

export const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className={className}>
    <ol className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

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
              <Link href={item.href} className="text-gray-500 hover:text-gray-700">
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'font-medium text-gray-900' : 'text-gray-500'}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
