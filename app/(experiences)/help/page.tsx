'use client';

import sanitizeHtml from 'sanitize-html';

import { PageLayoutContent } from '@/app/components/pageLayoutContent';
import { useHelp } from '@/app/(experiences)/hooks/usePages';

import { Loader } from '@/app/shared/components/Forms/form/loader';

export default function HelpPage() {
  const { data, isPending, isError } = useHelp();

  return (
    <PageLayoutContent>
      <div className="h-[27rem] overflow-auto" role="region" aria-label="Help content">
        {isPending ? (
          <div className="flex h-full items-center justify-center">
            <Loader size="large" />
          </div>
        ) : isError ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h1>Help</h1>
            <p className="text-destructive">Failed to load help content. Please try again later.</p>
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
}
