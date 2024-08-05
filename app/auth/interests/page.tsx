'use client';
import { hugeiconsLicense } from '@hugeicons/react-pro';
import * as HugeIcons from '@hugeicons/react-pro';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@/app/ui/form';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Loader from '@/app/ui/form/loader';
import { NotificationContext } from '@/providers/NotificationProvider';
import { removeUser } from '@/slices/userSlice';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);
export default function Page() {
  const router = useRouter();
  const toast = useContext(NotificationContext);
  const newUser = useSelector((state) => state.newUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [interests, setInterests] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const onSubmit = async () => {
    setIsSubmitting(true);
    const response = await fetch('/auth/interests/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newUser.payload, ...{ interests: interests } }),
    });

    const res = await response.json();

    if (!response.ok) {
      setIsSubmitting(false);
      toast.open('error', 'Sign up unsuccessful', res.message);
      return;
    }

    toast.open('success', 'Account created', 'Your next adventure awaits!');
    setIsSubmitting(false);
    removeUser();
    router.push('/auth/payments');
  };
  const getInterests = async () => {
    const response = await fetch('/auth/interests/api', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await response.json();
    setInterests(res?.interests);
    setLoading(false);
  };

  useEffect(() => {
    getInterests();
  }, []);

  const addOrRemoveInterest = (value: string) => {
    if (selectedInterests.includes(value)) {
      setSelectedInterests(
        selectedInterests.filter((selectedInterest) => selectedInterest !== value),
      );
    } else {
      setSelectedInterests([...selectedInterests, value]);
    }
  };

  return (
    <>
      <div className="mb-2">
        <p className="text-xl font-black text-gray-700">Select your interests</p>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-700">What are some of your favorite experiences?</p>
      </div>

      <div className="mb-4 inline-flex w-full flex-wrap gap-x-2 gap-y-2">
        {loading ? (
          <div className="my-2.5 inline-flex w-full items-center justify-center">
            <Loader size={8} />
          </div>
        ) : interests.length ? (
          interests.map((interest) => {
            const active = selectedInterests.includes(interest.id);
            return (
              <div
                key={interest.id}
                onClick={() => addOrRemoveInterest(interest.id)}
                className={clsx(
                  'inline-flex w-fit cursor-pointer items-center rounded-full px-4 py-2',
                  {
                    'bg-primary text-white': active,
                    'bg-gray-100': !active,
                  },
                )}
              >
                <div className="mr-2">
                  {React.createElement(HugeIcons[`${interest.icon}`], {
                    size: 16,
                    variant: 'twotone',
                  })}
                </div>
                <span className="text-xs">{interest.name}</span>
              </div>
            );
          })
        ) : null}
      </div>

      <div>
        <Button block loading={isSubmitting} onClick={onSubmit}>
          Submit
        </Button>
      </div>
    </>
  );
}
