'use client';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { AppleIcon, GoogleIcon, LockKeyIcon, Mail02Icon } from '@hugeicons/react-pro';

import { Anchor, Input } from '@/app/components/form';
import MobileStore from '@/app/components/mobileStore';
import { toast } from '@/hooks/use-toast';
import { addUser } from '@/slices/userSlice';

import { Button } from '../button';

type Inputs = {
  email: string;
  password: string;
};

export default function SignInForm({ onLogin }: { onLogin: () => void }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const pendingVerificationMessage =
    'User account is pending verification. Please check your email for a verification link.';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: 'onChange' });

  const getAuthErrorMessage = (res: Awaited<ReturnType<typeof signIn>>) => {
    const fallback =
      'Invalid credentials, please check your email and password or sign up if you do not have an account.';

    if (!res) return fallback;

    let message: string | undefined = res.error ?? undefined;

    if (!message && res.url) {
      try {
        const url = new URL(res.url, window.location.origin);
        message = url.searchParams.get('error') || undefined;
      } catch {
        message = undefined;
      }
    }

    if (!message || message === 'CredentialsSignin') return fallback;

    try {
      return decodeURIComponent(message);
    } catch {
      return message;
    }
  };

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
      const errorMessage = getAuthErrorMessage(res);

      if (errorMessage === pendingVerificationMessage) {
        dispatch(addUser(data));
        toast({
          title: 'Info',
          description: errorMessage,
        });
        router.push(`/auth/otp-confirmation?email=${encodeURIComponent(data.email)}`);
        return;
      }

      toast({
        description: errorMessage,
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
}
