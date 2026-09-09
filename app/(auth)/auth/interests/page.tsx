// noinspection
'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import moment from 'moment-timezone';

import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { CategoryPill } from '@/components/ui/categoryPill';
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

    if (session?.user) {
      router.push('/');
      return;
    }

    router.push('/auth/otp-confirmation');
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select your interests</h2>
        <p className="mt-1 text-base text-gray-500">What are some of your favorite experiences?</p>
      </div>

      {/* The same pill the create flows pick categories with, rather than the
          copy of it this page used to carry */}
      <div className="mb-6 flex w-full flex-wrap gap-2">
        {loading
          ? Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-10 w-28 animate-pulse rounded-full bg-gray-100" />
            ))
          : interests.map((interest) => (
              <CategoryPill
                key={interest.id}
                category={interest}
                isSelected={selectedInterests.includes(interest.id)}
                onClick={() => addOrRemoveInterest(interest.id)}
              />
            ))}
      </div>

      <Button
        variant="gradient"
        isLoading={isSubmitting}
        onClick={onSubmit}
        className="h-[52px] w-full rounded-full text-base font-semibold"
      >
        Submit
      </Button>
    </>
  );
}
