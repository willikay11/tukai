// noinspection TypeScriptValidateTypes,JSRemoveUnnecessaryParentheses

'use client';

import { Anchor, Button, Input } from '@/app/components/form';
import { GoogleIcon, LockKeyIcon, Mail02Icon } from '@hugeicons/react-pro';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import MobileStore from '@/app/components/mobileStore';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';

type Inputs = {
  email: string;
  password: string;
};
export default function Page() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: 'onChange' });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (res?.status === 200) {
      toast({
        // title: "Login successful",
        description: 'Welcome Back!',
        variant: 'success',
      });

      router.push('/');
    } else {
      toast({
        // title: "Login unsuccessful",
        description: res?.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="mb-4">
        <p className="text-xl font-black text-gray-700">Welcome Back!</p>
        <p className="text-xl font-black text-gray-700">Add your details to continue!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-2">
          <Input
            name="email"
            placeholder="Enter Email Address"
            type="text"
            icon={<Mail02Icon size={16} variant="twotone" />}
            refs={register('email', {
              required: 'Please enter your email address',
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />
        </div>

        <div className="mb-2">
          <Input
            name="password"
            placeholder="Enter Password"
            type="password"
            icon={<LockKeyIcon size={16} variant="twotone" />}
            refs={register('password', { required: 'Please enter password' })}
            error={errors.password?.message}
          />
        </div>

        <div className="mb-2.5">
          <Button block htmlType="submit" loading={isSubmitting}>
            Sign In
          </Button>
        </div>
      </form>

      <div className="mb-4 flex justify-end">
        <Anchor link="/auth/forgot-password">Forgot Password?</Anchor>
      </div>

      <div className="mb-2.5">
        <Button block onClick={() => signIn('google')} type="blue">
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
          By continuing to use Oltukai, you agree to our{' '}
          <Anchor link="/auth/terms-of-service">Terms of Use</Anchor>
          &nbsp;and <Anchor link="/auth/terms-of-service">Privacy Policy</Anchor>
        </p>
      </div>

      <div className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]" />

      <MobileStore />
    </>
  );
}
