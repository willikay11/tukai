'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';

/**
 * "No communities... yet!" - the My communities tab's own empty state, with
 * the terms/privacy links the handoff calls for (they toast for now - there
 * is nowhere real to send them yet).
 */
export const EmptyMyCommunities = () => {
  const { toast } = useToast();

  return (
    <div className="mx-auto mt-16 flex max-w-[520px] flex-col items-center text-center">
      <h2 className="mt-6 text-[22px] font-bold tracking-[-0.3px] text-brand-ink">
        No communities... yet!
      </h2>

      <p className="mt-2.5 text-[15px] leading-[1.55] text-gray-800 [text-wrap:pretty]">
        Think of a community as your website, business, social media page, or even a WhatsApp
        group. It helps you organise your activities and keeps members connected throughout
        different experiences.
      </p>

      <p className="mt-[18px] text-sm leading-[1.6] text-ink-muted [text-wrap:pretty]">
        By creating a community, you agree to our{' '}
        <button
          type="button"
          onClick={() => toast({ description: 'Terms of use are coming soon.' })}
          className="font-semibold text-brand underline underline-offset-2"
        >
          terms of use
        </button>{' '}
        and{' '}
        <button
          type="button"
          onClick={() => toast({ description: 'The privacy policy is coming soon.' })}
          className="font-semibold text-brand underline underline-offset-2"
        >
          privacy policy
        </button>
        .
      </p>

      <Link
        href="/communities/create"
        className="mt-[26px] inline-flex h-[52px] w-full max-w-[420px] items-center justify-center gap-2 rounded-full bg-lime text-base font-semibold text-brand-ink transition-[filter] hover:brightness-[.96] active:scale-[.98]"
      >
        <IconComponent iconName="UserGroupIcon" size={20} color="currentColor" />
        Create community
      </Link>
    </div>
  );
};
