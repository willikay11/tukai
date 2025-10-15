'use client';

import { Cancel01Icon, hugeiconsLicense } from '@hugeicons/react-pro';
import Image from 'next/image';
import { Button } from '@/app/components/form';
import { useState } from 'react';
import clsx from 'clsx';
// import { Portal } from '@/components/ui/Portal';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

export default function DownloadApp() {
  const [closed, setClosed] = useState<boolean>(false);

  if (closed) return null;

  return (
    <p></p>
    // <Portal>
    //   <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white px-4 py-4 shadow-lg">
    //     <div className="flex w-full items-center justify-between">
    //       <div className="flex items-center">
    //         <Cancel01Icon
    //           size={16}
    //           variant="twotone"
    //           className="mr-2 cursor-pointer"
    //           onClick={() => setClosed(true)}
    //         />
    //         <Image
    //           src="/images/logo-small.svg"
    //           alt="Oltukai logo"
    //           width={30}
    //           height={40}
    //           className="mr-2"
    //         />
    //         <div className="flex flex-col">
    //           <p className="text-sm font-medium">Download the app</p>
    //           <p className="text-xs font-normal text-gray-400">
    //             Enjoy the best experience on the app
    //           </p>
    //         </div>
    //       </div>
    //       <Button onClick={() => console.log('Download app')} size="small">
    //         Use App
    //       </Button>
    //     </div>
    //   </div>
    // </Portal>
  );
}
