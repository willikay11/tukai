import React from 'react';

import { render, screen } from '@testing-library/react';

import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { Experience } from '@/types/experience';

import { ListExperiences } from './index';

jest.mock('@/context/SelectedCategoryContext');
jest.mock('@/app/shared/components/Experiences/Single', () => ({
  SingleExperience: ({ experience }: { experience: Experience }) => (
    <div data-testid={experience.id.startsWith('placeholder-') ? 'skeleton' : 'card'}>
      {experience.title}
    </div>
  ),
}));
jest.mock('next/link', () => {
  function MockLink({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function MotionDiv(
      { children, ...props },
      ref,
    ) {
      return (
        <div ref={ref} {...props}>
          {children}
        </div>
      );
    }),
  },
}));

const mockUseSelectedCategory = useSelectedCategory as jest.MockedFunction<
  typeof useSelectedCategory
>;

const makeExperiences = (page: number, size: number): Experience[] =>
  Array.from(
    { length: size },
    (_, index) =>
      ({ id: `p${page}-e${index}`, title: `Page ${page} item ${index}` }) as unknown as Experience,
  );

const PAGE_SIZE = 12;
const TOTAL = 20;

// The reset effect depends on `setPage` identity, so every render in a test
// must share one instance — exactly as a real parent does with useState.
const fixedProps = () => ({
  type: 'discover' as const,
  className: '',
  count: TOTAL,
  skeletonCount: PAGE_SIZE,
  setPage: jest.fn(),
});

beforeEach(() => {
  mockUseSelectedCategory.mockReturnValue({
    selectedCategoryId: undefined,
    selectedCitySearchId: undefined,
    setSelectedCategoryId: jest.fn(),
    setSelectedCitySearchId: jest.fn(),
  });
});

describe('ListExperiences pagination', () => {
  it('renders the first page of results', () => {
    render(
      <ListExperiences
        {...fixedProps()}
        page={1}
        isLoading={false}
        experiences={makeExperiences(1, PAGE_SIZE)}
      />,
    );

    expect(screen.getAllByTestId('card')).toHaveLength(PAGE_SIZE);
    expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
  });

  // Regression: the loading pass and the results pass of the update effect both
  // run with page === 2. A single shared "last page seen" ref was consumed by
  // the loading pass, so the results pass never appended and the skeletons
  // stayed on screen for good.
  it('replaces page-two skeletons with page-two results', () => {
    const props = fixedProps();
    const { rerender } = render(
      <ListExperiences
        {...props}
        page={1}
        isLoading={false}
        experiences={makeExperiences(1, PAGE_SIZE)}
      />,
    );

    // Scrolled to the bottom: page 2 is in flight, so skeletons are appended
    rerender(<ListExperiences {...props} page={2} isLoading={true} experiences={[]} />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(PAGE_SIZE);
    expect(screen.getAllByTestId('card')).toHaveLength(PAGE_SIZE);

    // Page 2 lands
    rerender(
      <ListExperiences
        {...props}
        page={2}
        isLoading={false}
        experiences={makeExperiences(2, TOTAL - PAGE_SIZE)}
      />,
    );

    expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    expect(screen.getAllByTestId('card')).toHaveLength(TOTAL);
    expect(screen.getByText('Page 1 item 0')).toBeInTheDocument();
    expect(screen.getByText('Page 2 item 0')).toBeInTheDocument();
  });

  it('does not duplicate a page when the effect re-runs on the same page', () => {
    const props = fixedProps();
    const { rerender } = render(
      <ListExperiences
        {...props}
        page={1}
        isLoading={false}
        experiences={makeExperiences(1, PAGE_SIZE)}
      />,
    );
    rerender(<ListExperiences {...props} page={2} isLoading={true} experiences={[]} />);

    const pageTwo = makeExperiences(2, TOTAL - PAGE_SIZE);
    rerender(<ListExperiences {...props} page={2} isLoading={false} experiences={pageTwo} />);
    // A refetch on the same page re-runs the effect with a new array identity
    rerender(<ListExperiences {...props} page={2} isLoading={false} experiences={[...pageTwo]} />);

    expect(screen.getAllByTestId('card')).toHaveLength(TOTAL);
  });

  it('shows the empty state when the first page comes back empty', () => {
    render(<ListExperiences {...fixedProps()} page={1} isLoading={false} experiences={[]} />);

    expect(screen.getByText('No experiences found')).toBeInTheDocument();
  });
});
