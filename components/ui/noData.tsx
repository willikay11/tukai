'use client';

import Image from 'next/image';

export const NoData = ({ message = 'No data' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image src="/images/no-data.svg" alt="No data" width={100} height={100} />
      <p className="mt-2 text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
};

