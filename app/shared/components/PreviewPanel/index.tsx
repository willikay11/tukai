'use client';

import { ReactNode } from 'react';

import Image from 'next/image';

interface PreviewPanelProps {
  title: string;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}

export const PreviewPanel = ({ title, isEmpty, emptyText, children }: PreviewPanelProps) => {
  return (
    <div className="xs:px-4 xs:py-4 h-full rounded-t-xl bg-white md:border-x md:border-t-[1px] md:border-gray-200 md:px-12 md:py-6 md:shadow-lg">
      {isEmpty ? (
        <>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <div className="mt-6 flex flex-col items-center justify-center">
            <Image src="/images/chilling.svg" alt={title} width={240} height={240} />
            <p className="mt-4 text-center text-xs text-gray-500">{emptyText}</p>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <div className="mt-6 space-y-6">{children}</div>
        </>
      )}
    </div>
  );
};
