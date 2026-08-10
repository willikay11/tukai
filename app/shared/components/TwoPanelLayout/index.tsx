import { ReactNode } from 'react';

interface TwoPanelLayoutProps {
  left: ReactNode;
  // Omit to render a single left-aligned column
  right?: ReactNode;
  // Widens the left column to the full content width. The default column is
  // sized for a form; full-page content (e.g. the create-flow preview step,
  // which renders the customer detail view) needs the room.
  wide?: boolean;
}

const NARROW_LEFT =
  'col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-5 xl:col-start-2 3xl:col-span-3 3xl:col-start-3 4xl:col-span-2 4xl:col-start-4';

const WIDE_LEFT = 'col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0';

export const TwoPanelLayout = ({ left, right, wide = false }: TwoPanelLayoutProps) => {
  return (
    <main className="mt-6 grid min-h-screen grid-cols-12 items-stretch gap-12 px-4 md:px-0">
      {/* Left panel */}
      <div className={wide ? WIDE_LEFT : NARROW_LEFT}>{left}</div>

      {/* Right panel */}
      {right && (
        <div className="hidden h-full lg:col-span-4 lg:col-start-7 lg:block xl:col-span-5 xl:col-start-7 3xl:col-span-3 3xl:col-start-8 4xl:col-span-2 4xl:col-start-8">
          {right}
        </div>
      )}
    </main>
  );
};
