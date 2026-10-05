import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

/**
 * Just enough to draw a face. This used to borrow the bucket-list member type,
 * which tied a stack of community avatars to a feature it has nothing to do
 * with - and broke the moment that type matched the API.
 */
export interface AvatarStackUser {
  id: string;
  name: string;
  picture?: string | null;
}

interface AvatarStackProps {
  users: AvatarStackUser[];
  max?: number;
  // Overrides the overflow derived from `users`, for callers that hold a total
  // count larger than the handful of avatars they were given
  extraCount?: number;
  /** The canvas draws 21px faces on a card and 28px elsewhere. */
  size?: 'sm' | 'md';
  /** On a card the canvas writes the overflow as text, not as another circle. */
  plainOverflow?: boolean;
}

export const AvatarStack = ({
  users,
  max = 3,
  extraCount,
  size = 'md',
  plainOverflow = false,
}: AvatarStackProps) => {
  if (users.length === 0) return null;

  const visible = users.slice(0, max);
  const overflow = extraCount ?? users.length - visible.length;
  const face = size === 'sm' ? 'h-[21px] w-[21px]' : 'h-7 w-7';

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((user) => (
        <div
          key={user.id}
          className={cn(
            'relative overflow-hidden rounded-full bg-surface-brand ring-2 ring-white',
            face,
          )}
          title={user.name}
        >
          <PhotoImage
            src={user.picture}
            alt={user.name}
            fill
            sizes={size === 'sm' ? '21px' : '28px'}
            className="object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
            }
          />
        </div>
      ))}
      {overflow > 0 &&
        (plainOverflow ? (
          <span className="relative pl-3 text-13 font-semibold text-ink-muted">+{overflow}</span>
        ) : (
          <div
            className={cn(
              'relative flex items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600 ring-2 ring-white',
              face,
            )}
          >
            +{overflow}
          </div>
        ))}
    </div>
  );
};
