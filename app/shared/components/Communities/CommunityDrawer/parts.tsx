import { ReactNode } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

/** The h3 Socials, Members, Upcoming experiences and Moments share, with its sub line. */
export const SectionHeading = ({ title, sub }: { title: ReactNode; sub?: ReactNode }) => (
  <div>
    <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">{title}</h3>
    {sub && (
      <p className="mt-1.5 text-sm leading-[1.45] text-ink-muted [text-wrap:pretty]">{sub}</p>
    )}
  </div>
);

/** Full-bleed: it runs out through the body's 24px gutters. */
export const Divider = () => <div aria-hidden className="-mx-6 h-px flex-none bg-gray-200" />;

/** A round photo, or the name's initial on pale green when there is none. */
export const Avatar = ({
  src,
  name,
  size,
  className,
}: {
  src?: string | null;
  name: string;
  size: number;
  className?: string;
}) => (
  <span
    className={cn(
      'relative flex-shrink-0 overflow-hidden rounded-full bg-surface-brand',
      className,
    )}
    style={{ width: size, height: size }}
  >
    <PhotoImage
      src={src}
      alt=""
      fill
      sizes={`${size}px`}
      className="object-cover"
      fallback={
        <span className="flex h-full w-full items-center justify-center text-[13px] font-bold text-brand-ink">
          {name.charAt(0).toUpperCase()}
        </span>
      }
    />
  </span>
);
