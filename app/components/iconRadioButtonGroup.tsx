'use client';

import { useState } from 'react';

import { GridViewIcon, MapPinpoint02Icon, hugeiconsLicense } from '@hugeicons/react-pro';
import clsx from 'clsx';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

export default function IconRadioButtonGroup() {
  const [selectedOption, setSelectedOption] = useState<string>('one');

  const options = [
    {
      label: 'one',
      icon: <GridViewIcon size={16} variant="twotone" />,
    },
    {
      label: 'two',
      icon: <MapPinpoint02Icon size={16} variant="twotone" />,
    },
  ];

  return (
    <div className="item-center flex hidden h-10 rounded-[50px] border-[1px] border-gray-200 bg-white px-1 py-1">
      <div className={`grid grid-cols-2 gap-2`}>
        {options.map((option) => (
          <div
            key={option.label}
            onClick={() => setSelectedOption(option.label)}
            className={clsx(
              'flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full',
              {
                'bg-emerald-100 text-primary': option.label === selectedOption,
                'bg-gray-50 text-gray-500': option.label !== selectedOption,
              },
            )}
          >
            {option.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
