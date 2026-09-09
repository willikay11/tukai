'use client';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { LockKeyIcon, Mail02Icon } from '@hugeicons/react-pro';

import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addUser } from '@/slices/userSlice';

type Inputs = {
  email: string;
  password: string;
};

const PENDING_VERIFICATION =
  'User account is pending verification. Please check your email for a verification link.';

const getAuthErrorMessage = (res: Awaited<ReturnType<typeof signIn>>) => {
  const fallback =
    'Invalid credentials, please check your email and password or sign up if you do not have an account.';

  if (!res) return fallback;

  let message: string | undefined = res.error ?? undefined;

  if (!message && res.url) {
    try {
      message = new URL(res.url, window.location.origin).searchParams.get('error') || undefined;
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

/**
 * Signing in with an email address.
 *
 * Only the form: the social buttons, the small print and the store badges
 * belong to the card around it, so the dialog and the sign-up page show one of
 * each rather than two.
 *
 * Fields are the shared {@link Input}, not the auth-only copy that used to live
 * in the Forms folder — they sit at the same size and weight as every other
 * field in the app.
 */
export const EmailSignInForm = ({ onLogin }: { onLogin: () => void }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      return;
    }

    const errorMessage = getAuthErrorMessage(res);

    if (errorMessage === PENDING_VERIFICATION) {
      dispatch(addUser(data));
      toast({ title: 'Info', description: errorMessage });
      router.push(`/auth/otp-confirmation?email=${encodeURIComponent(data.email)}`);
      return;
    }

    toast({ description: errorMessage, variant: 'destructive' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Input
          type="email"
          placeholder="Enter email address"
          aria-label="Email address"
          icon={<Mail02Icon size={18} variant="twotone" />}
          {...register('email', {
            required: 'Please enter your email address',
            pattern: {
              value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Input
          type="password"
          placeholder="Enter password"
          aria-label="Password"
          icon={<LockKeyIcon size={18} variant="twotone" />}
          {...register('password', { required: 'Please enter password' })}
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="gradient"
        isLoading={isSubmitting}
        className="h-[52px] w-full rounded-full text-base font-semibold"
      >
        Sign In
      </Button>
    </form>
  );
};
