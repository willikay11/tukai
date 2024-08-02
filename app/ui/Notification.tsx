'use client';

import { Cancel01Icon, InformationCircleIcon, TickDouble01Icon } from '@hugeicons/react-pro';
import React, { ReactNode } from 'react';

const getColors = (type) => {
  let c: { lightColor: string; darkColor: string; icon: ReactNode } = {};
  switch (type) {
    case 'error': {
      c = {
        lightColor: 'bg-red-50',
        darkColor: 'bg-red-100',
        icon: <Cancel01Icon variant="twotone" className="text-red-400" size={16} />,
      };
      break;
    }
    case 'success': {
      c = {
        lightColor: 'bg-green-50',
        darkColor: 'bg-green-100',
        icon: <TickDouble01Icon variant="twotone" className="text-green-400" size={16} />,
      };
      break;
    }
    default: {
      c = {
        lightColor: 'bg-blue-50',
        darkColor: 'bg-blue-100',
        icon: <InformationCircleIcon variant="twotone" className="text-green-400" size={16} />,
      };
    }
  }

  return c;
};
export default function Notification({
  type,
  title,
  message,
  onClose,
}: {
  type: 'success' | 'info' | 'error';
  title: string;
  message?: string;
  onClose: () => void;
}) {
  const c = getColors(type);
  return (
    <div className="relative flex items-start rounded-[4px] border-[1px] border-gray-100 bg-white px-6 py-4">
      <div className="inline-flex">
        <div className="mr-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${c.lightColor}`}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${c.darkColor}`}>
              {c.icon}
            </div>
          </div>
        </div>
        <div className="flex-col">
          <p className="text-base font-medium">{title}</p>
          {message ? <p className="text-xs">{message}</p> : null}
        </div>
      </div>
      <button className="ml-6" onClick={onClose}>
        <Cancel01Icon variant="twotone" size={16} />
      </button>
    </div>
  );
}
