import { ReactNode } from 'react';

import Link from 'next/link';

export const Anchor = ({ children, link }: { children: ReactNode; link: string }) => {
  return (
    <Link href={link} className="text-xs font-medium text-primary hover:underline">
      {children}
    </Link>
  );
};
