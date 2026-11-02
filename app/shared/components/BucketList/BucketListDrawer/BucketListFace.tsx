import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';
import { LinkedUser, linkedUserName } from '@/types/user';

/**
 * A person's round photo, or their initial on soft green when there is none -
 * the owner button, the member faces, the Members grid and the invite chips
 * all draw people this way, at different sizes.
 */
export const BucketListFace = ({
  user,
  className,
  initialClassName,
  sizes,
}: {
  user?: LinkedUser | null;
  /** Size, ring and radius - the face is always a circle. */
  className: string;
  /** The initial's type size and weight. */
  initialClassName: string;
  sizes: string;
}) => (
  <span
    aria-hidden="true"
    className={cn(
      'relative block flex-shrink-0 overflow-hidden rounded-full bg-surface-brand',
      className,
    )}
  >
    <PhotoImage
      src={user?.picture ?? undefined}
      alt=""
      fill
      sizes={sizes}
      className="object-cover"
      fallback={
        <span
          className={cn(
            'flex h-full w-full items-center justify-center bg-surface-tab text-brand',
            initialClassName,
          )}
        >
          {linkedUserName(user).charAt(0).toUpperCase()}
        </span>
      }
    />
  </span>
);
