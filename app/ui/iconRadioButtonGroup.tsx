'use client';

import { GridViewIcon, hugeiconsLicense, MapPinpoint02Icon } from '@hugeicons/react-pro';
import clsx from 'clsx';
import { useState } from 'react';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

export default function IconRadioButtonGroup() {
  const [selectedOption, setSelectedOption] = useState<string>('one');

  const options = [
    {
      label: 'one',
      icon: (
        <GridViewIcon
          className={clsx('', {
            'text-white': selectedOption === 'one',
            'text-gray-500': selectedOption !== 'one',
          })}
          size={18}
          variant="twotone"
        />
      ),
    },
    {
      label: 'two',
      icon: (
        <MapPinpoint02Icon
          className={clsx('', {
            'text-white': selectedOption === 'two',
            'text-gray-500': selectedOption !== 'two',
          })}
          size={18}
          variant="twotone"
        />
      ),
    },
  ];

  return (
    <div className="item-center flex rounded-[50px] border-[1px] border-gray-200 bg-white px-1 py-1">
      <div className={`grid grid-cols-2 gap-2`}>
        {options.map((option) => (
          <div
            key={option.label}
            onClick={() => setSelectedOption(option.label)}
            className={clsx(
              'flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full',
              {
                'bg-primary': option.label === selectedOption,
                'bg-gray-50': option.label !== selectedOption,
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
