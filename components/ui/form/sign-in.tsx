'use client';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { signIn } from 'next-auth/react';

import { AppleIcon, GoogleIcon, LockKeyIcon, Mail02Icon } from '@hugeicons/react-pro';

import { MobileStore } from '@/app/shared/components/Download';
import { Anchor, Input } from '@/app/shared/components/Forms';
import { toast } from '@/app/shared/hooks/useToast';

import { Button } from '../button';

type Inputs = {
  email: string;
  password: string;
};

export const SignInForm = ({ onLogin }: { onLogin: () => void }) => {
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
      onLogin();
    } else {
      toast({
        description:
          'Invalid credentials, please check your email and password or sign up if you do not have an account.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xl font-black text-gray-700">Welcome Back!</p>
        <p className="text-xl font-black text-gray-700">Add your details to continue!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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

        <Input
          name="password"
          placeholder="Enter Password"
          type="password"
          icon={<LockKeyIcon size={16} variant="twotone" />}
          refs={register('password', { required: 'Please enter password' })}
          error={errors.password?.message}
        />

        <Button className="h-[50px] w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="flex justify-end">
        <Anchor link="/auth/forgot-password">Forgot Password?</Anchor>
      </div>

      <Button
        className="h-[50px] w-full bg-blue-600 hover:bg-blue-700 focus:bg-blue-700"
        onClick={() =>
          signIn('google', {
            redirect: false,
            callbackUrl: '/',
          })
        }
      >
        <div className="inline-flex items-center font-medium">
          <GoogleIcon className="mr-2 text-white" variant="solid" type="sharp" /> Continue with
          Google
        </div>
      </Button>

      <Button
        className="h-[50px] w-full bg-black hover:bg-gray-900 focus:bg-gray-900"
        onClick={() =>
          signIn('apple', {
            redirect: false,
            callbackUrl: '/',
          })
        }
      >
        <div className="inline-flex items-center font-medium">
          <AppleIcon className="mr-2 text-white" variant="solid" type="sharp" /> Continue with Apple
        </div>
      </Button>

      <div className="flex w-full items-center font-medium">
        <span className="w-full text-center text-xs">
          Don&apos;t have an account? <Anchor link="/auth/sign-up">Sign up for free</Anchor>
        </span>
      </div>

      <div className="font-medium">
        <p className="text-xs">
          By continuing to use Tukai, you agree to our <Anchor link="/terms">Terms of Use</Anchor>
          &nbsp;and <Anchor link="/privacy">Privacy Policy</Anchor>
        </p>
      </div>

      <div className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]" />

      <MobileStore />
    </div>
  );
};
