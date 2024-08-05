'use client';

import Image from 'next/image';
import { Anchor, Button } from '@/app/ui/form';
import { GoogleIcon, hugeiconsLicense } from '@hugeicons/react-pro';
import { useRouter } from 'next/navigation';
import MobileStore from '@/app/ui/mobileStore';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

export default function Page() {
  const router = useRouter();

  return (
    <>
      <div className="mb-4">
        <p className="text-xl font-black text-gray-700">Create your free account</p>
      </div>

      <div className="mb-4">
        <Button block onClick={() => router.push('/auth/sign-up-free')}>
          Create a Free Account
        </Button>
      </div>

      <div className="mb-4 flex items-center">
        <div
          className="h-[1px] flex-grow rounded-[20px]"
          style={{ background: 'linear-gradient(90deg, rgba(4, 120, 87, 0.00) 0%, #047857 100%)' }}
        />
        <span className="mx-4 text-xs">Or</span>
        <div
          className="h-[1px] flex-grow rounded-[20px]"
          style={{ background: 'linear-gradient(90deg, #047857 0%, rgba(4, 120, 87, 0.00) 100%)' }}
        />
      </div>

      <div className="mb-2.5">
        <Button block onClick={() => {}} type="blue">
          <div className="inline-flex items-center">
            <GoogleIcon className="mr-2 text-white" variant="solid" type="sharp" /> Continue with
            Google
          </div>
        </Button>
      </div>

      <div className="mb-4 flex w-full items-center">
        <span className="w-full text-center text-xs">
          Already have an account? <Anchor link="/auth/sign-in">Sign in</Anchor>
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs font-normal">
          By continuing to use Oltukai, you agree to our <Anchor link="">Terms of Use</Anchor>
          &nbsp;and <Anchor link="">Privacy Policy</Anchor>
        </p>
      </div>

      <div className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]" />

      <MobileStore />
    </>
  );
}
