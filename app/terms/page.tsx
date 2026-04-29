'use client';

import sanitizeHtml from 'sanitize-html';

import { PageLayoutContent } from '@/app/components/pageLayoutContent';
import { useTermsOfService } from '@/hooks/pages';

import Loader from '../components/form/loader';

export const TermsPage = () => {
  const { data, isPending, isError } = useTermsOfService();

  return (
    <PageLayoutContent>
      <div className="h-[27rem] overflow-auto" role="region" aria-label="Terms of Service content">
        {isPending ? (
          <div className="flex h-full items-center justify-center">
            <Loader size="large" />
          </div>
        ) : isError ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h1>Terms of Service</h1>
            <p className="text-destructive">
              Failed to load terms of service. Please try again later.
            </p>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground">
              Last updated:{' '}
              {data?.dateModified ? new Date(data.dateModified).toLocaleDateString() : '-'}
            </p>
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.content || '') }} />
          </div>
        )}
      </div>
    </PageLayoutContent>
  );
};
