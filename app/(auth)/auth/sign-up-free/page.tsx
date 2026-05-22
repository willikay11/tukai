// noinspection TypeScriptValidateTypes

'use client';

import { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/navigation';

import { LockKeyIcon, Mail02Icon, UserIcon } from '@hugeicons/react-pro';

import { MobileStore } from '@/app/shared/components/Download';
import { Anchor, Input } from '@/app/shared/components/Forms';
import { useUserExists } from '@/app/shared/hooks/useAuth';
import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { addUser } from '@/slices/userSlice';

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
};

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const newUser = useSelector((state: any) => state.userReducer.newUser);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<Inputs>({ mode: 'onChange' });

  const {
    data: userExistsData,
    isPending: isCheckingEmail,
    mutate: checkUserExists,
  } = useUserExists();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    delete data?.confirmPassword;
    dispatch(addUser(data));
    router.push('/auth/interests');
    setIsSubmitting(false);
  };

  // Update last checked email when we get results
  useEffect(() => {
    if (userExistsData?.exists === true) {
      setError('email', {
        type: 'manual',
        message: 'This email already exists. Please login or use a different email.',
      });
    } else if (userExistsData?.exists === false) {
      clearErrors('email');
    }
  }, [userExistsData, setError, clearErrors]);

  return (
    <>
      <div className="mb-4">
        <p className="text-xl font-black text-gray-700">Create an account to access</p>
        <p className="text-xl font-black text-gray-700">Experiences & Join Communities</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <Input
            name="firstName"
            placeholder="First Name"
            defaultValue={newUser?.payload?.firstName}
            type="text"
            icon={<UserIcon size={16} />}
            refs={register('firstName', {
              required: 'Please enter your first name',
            })}
            error={errors.firstName?.message}
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            defaultValue={newUser?.payload?.lastName}
            type="text"
            icon={<UserIcon size={16} />}
            refs={register('lastName', {
              required: 'Please enter your last name',
            })}
            error={errors.lastName?.message}
          />
        </div>

        <div className="mb-2">
          <Input
            name="email"
            placeholder="Enter Email Address"
            defaultValue={newUser?.payload?.email}
            type="text"
            icon={<Mail02Icon size={16} />}
            refs={register('email', {
              required: 'Please enter your email address',
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Invalid email address',
              },
              onChange: (e) => {
                const email = e.target.value;
                if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
                  debounce(() => checkUserExists(email), 800)();
                }
              },
            })}
            error={errors.email?.message}
          />
          {isCheckingEmail ? (
            <div className="mt-1 text-xs text-blue-500">Checking email...</div>
          ) : null}
        </div>

        <div className="mb-2">
          <Input
            name="password"
            placeholder="Enter Password"
            type="password"
            defaultValue={newUser?.payload?.password}
            icon={<LockKeyIcon size={16} />}
            refs={register('password', {
              required: 'Please enter your password',
            })}
            error={errors.password?.message}
          />
        </div>

        <div className="mb-2">
          <Input
            name="confirmPassword"
            placeholder="Confirm Password"
            defaultValue={newUser?.payload?.password}
            type="password"
            icon={<LockKeyIcon size={16} />}
            refs={register('confirmPassword', {
              required: 'Please enter your password',
              // pattern: {
              //     value: /apple/,
              //     message: 'Passwords do not match'
              // }
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="mb-2.5">
          <Button
            className="h-[50px] w-full"
            disabled={isCheckingEmail || isSubmitting || userExistsData?.exists === true}
          >
            {isSubmitting ? 'Creating Account...' : 'Create a Free Account'}
          </Button>
        </div>
      </form>

      <div className="mb-4 flex w-full items-center">
        <span className="w-full text-center text-xs font-medium">
          Already have an account? <Anchor link="/auth/sign-in">Sign in</Anchor>
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs font-medium">
          By continuing to use Tukai, you agree to our <Anchor link="/terms">Terms of Use</Anchor>
          &nbsp;and <Anchor link="/privacy">Privacy Policy</Anchor>
        </p>
      </div>

      <div className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]" />

      <MobileStore />
    </>
  );
}
