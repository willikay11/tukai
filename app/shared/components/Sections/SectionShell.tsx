import { ReactNode } from 'react';

/**
 * One anchored section of the community page. The scroll margin keeps the
 * heading clear of what is pinned above it when the reader jumps here from a
 * pill: the pill row alone on mobile, the global navbar plus the pill row from
 * md up.
 */
export const SectionShell = ({
  id,
  title,
  subtitle,
  action,
  children,
}: {
  id: string;
  // Omitted where the content speaks for itself — the About section opens on
  // its photos rather than repeating the tab's label
  title?: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section id={id} className="scroll-mt-20 md:scroll-mt-32">
    {(title || action) && (
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
          {subtitle && <div className="mt-1 text-sm text-gray-400">{subtitle}</div>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);
