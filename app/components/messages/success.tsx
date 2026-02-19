import React, { ReactNode } from 'react';

import * as HugeIcons from '@hugeicons/react-pro';

import { Button } from '@/app/components/form';

import IconComponent from '../iconComponent';

export default function SuccessMessage({
  title,
  icon,
  description,
  onContinue,
  subDescription,
  buttonTitle = 'Continue',
}: {
  title: string;
  icon: string;
  description: string;
  onContinue: () => void;
  subDescription?: ReactNode;
  buttonTitle?: string;
}) {
  return (
    <>
      <div className="mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          {/* {
            React.createElement(HugeIcons[`${icon}`], {
              size: 30,
              variant: 'duotone',
              className: 'text-green-800',
            }) as any
          } */}
          <IconComponent iconName={icon} size={30} color="green" />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xl font-black text-gray-700">{title}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-700">
          {description}
          {subDescription ? subDescription : null}
        </p>
      </div>

      <Button block onClick={onContinue}>
        {buttonTitle}
      </Button>
    </>
  );
}
