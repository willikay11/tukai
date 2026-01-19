// noinspection
'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import clsx from 'clsx';
import moment from 'moment-timezone';

import { Button } from '@/app/components/form';
import Loader from '@/app/components/form/loader';
import IconComponent from '@/app/components/iconComponent';
import { toast } from '@/hooks/use-toast';
import { removeUser } from '@/slices/userSlice';

export default function Page() {
  const timezone = moment.tz.guess();
  const router = useRouter();
  const newUser = useSelector((state: any) => state.userReducer.newUser);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [interests, setInterests] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const onSubmit = async () => {
    setIsSubmitting(true);

    let body;
    if (session?.user) {
      body = {
        id: session?.user?.id,
        firstName: session?.user?.name?.split(' ')[0],
        lastName: session?.user?.name?.split(' ')[1],
        email: session?.user?.email,
        interests: selectedInterests,
        timezone: timezone,
      };
    } else {
      body = {
        ...newUser?.payload,
        ...{ interests: selectedInterests, timezone: timezone },
      };
    }

    const response = await fetch('/auth/interests/api', {
      method: session?.user ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const res = await response.json();

    if (!response.ok) {
      setIsSubmitting(false);
      toast({
        title: 'Interests not saved',
        description: res.message,
        variant: 'destructive',
      });

      if (res?.message.includes('already exists')) {
        router.push('/auth/sign-in');
      }
      return;
    }

    toast({
      title: 'Interests saved',
      description: 'Your next adventure awaits!',
      variant: 'success',
    });
    setIsSubmitting(false);
    removeUser();

    router.push('/');
    // if (session?.user) {
    //   router.push('/auth/payments');
    // } else {
    //   router.push('/auth/otp-confirmation');
    // }
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
            <Loader size="large" />
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
                  <IconComponent iconName={interest.icon} size={16} />
                </div>
                <span className="text-xs font-medium">{interest.name}</span>
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
