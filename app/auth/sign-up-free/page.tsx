// noinspection TypeScriptValidateTypes

'use client';

import { Anchor, Button, Input } from '@/app/ui/form';
import { hugeiconsLicense, LockKeyIcon, Mail02Icon, UserIcon } from '@hugeicons/react-pro';
import { useRouter } from 'next/navigation';
import MobileStore from '@/app/ui/mobileStore';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '@/slices/userSlice';
import { useState } from 'react';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
};

export default function Page() {
  // let password;
  const router = useRouter();
  const dispatch = useDispatch();
  const newUser = useSelector((state: any) => state.newUser);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: 'onChange' });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    delete data?.confirmPassword;
    dispatch(addUser(data));
    router.push('/auth/interests');
    setIsSubmitting(false);
  };

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
            })}
            error={errors.email?.message}
          />
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
              // onBlur: (e) => (password = e.target.value),
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
          <Button block htmlType="submit" loading={isSubmitting}>
            Create a Free Account
          </Button>
        </div>
      </form>

      <div className="mb-4 flex w-full items-center">
        <span className="w-full text-center text-xs">
          Already have an account? <Anchor link="/auth/sign-in">Sign in</Anchor>
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
