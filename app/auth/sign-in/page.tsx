'use client';

import Image from 'next/image';
import { Anchor, Button, Input } from '@/app/ui/form';
import { GoogleIcon, hugeiconsLicense, LockKeyIcon, Mail02Icon } from '@hugeicons/react-pro';
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
        <p className="text-xl font-black text-gray-700">Welcome Back!</p>
        <p className="text-xl font-black text-gray-700">Add your details to continue!</p>
      </div>

      <div className="mb-2">
        <Input
          placeholder="Enter Email Address"
          type="text"
          icon={<Mail02Icon size={16} variant="twotone" />}
        />
      </div>

      <div className="mb-2">
        <Input
          placeholder="Enter Password"
          type="password"
          icon={<LockKeyIcon size={16} variant="twotone" />}
        />
      </div>

      <div className="mb-2.5">
        <Button block onClick={() => router.push('/')}>
          Sign In
        </Button>
      </div>

      <div className="mb-4 flex justify-end">
        <Anchor link="">Forgot Password?</Anchor>
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
          Don&apos;t have an account? <Anchor link="/auth/sign-up">Sign up for free</Anchor>
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs">
          By continuing to use Oltukai, you agree to our <Anchor link="">Terms of Use</Anchor>
          &nbsp;and <Anchor link="">Privacy Policy</Anchor>
        </p>
      </div>

      <div className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]" />

      <MobileStore />
    </>
  );
}
