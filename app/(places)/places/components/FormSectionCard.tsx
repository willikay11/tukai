import { ReactNode } from 'react';

/**
 * One panel of a places form — the reservation form and the ownership claim
 * form are both built from these.
 */
export const FormSectionCard = ({
  title,
  optional,
  description,
  children,
}: {
  title: string;
  optional?: boolean;
  description?: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-gray-100 p-6">
    <div className="mb-1 flex items-center gap-3">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {optional && (
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Optional
        </span>
      )}
    </div>
    {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}
    {children}
  </section>
);
