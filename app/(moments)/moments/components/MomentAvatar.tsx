import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Thin wrapper over the shadcn Avatar that supplies the initial fallback every
// moments surface needs
export const MomentAvatar = ({
  src,
  name,
  size = 44,
}: {
  src: string | null;
  name: string;
  size?: number;
}) => (
  <Avatar className="flex-shrink-0" style={{ width: size, height: size }}>
    {src && <AvatarImage src={src} alt={name} className="object-cover" />}
    <AvatarFallback className="text-xs font-medium text-gray-600">
      {name.charAt(0).toUpperCase() || '?'}
    </AvatarFallback>
  </Avatar>
);
