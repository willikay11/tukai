import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { DiscoverGrid } from './index';

jest.mock('next/link', () => {
  function MockLink({ children, href, ...rest }: Record<string, unknown>) {
    return (
      <a href={href as string} {...rest}>
        {children as React.ReactNode}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/app/shared/components/Experiences/Single', () => ({
  SingleExperience: ({ experience }: { experience: Experience }) => <span>{experience.title}</span>,
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const experience = (id: string, title: string) =>
  ({ id, title, slug: id }) as unknown as Experience;

const page = [experience('1', 'Lake walk'), experience('2', 'Pottery class')];

const baseProps = {
  experiences: page,
  total: 20,
  page: 1,
  onPageChange: jest.fn(),
  isLoading: false,
};

describe('DiscoverGrid', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses the heading and a subtitle that counts without naming a city', () => {
    render(<DiscoverGrid {...baseProps} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Discover experiences');
    expect(screen.getByText('20 experiences')).toBeInTheDocument();
    expect(screen.queryByText(/in and around/)).not.toBeInTheDocument();
  });

  it('uses the singular noun for a total of one', () => {
    render(<DiscoverGrid {...baseProps} experiences={[page[0]]} total={1} />);

    expect(screen.getByText('1 experience')).toBeInTheDocument();
  });

  it('shows the experiences on the page', () => {
    render(<DiscoverGrid {...baseProps} />);

    expect(screen.getByText('Lake walk')).toBeInTheDocument();
    expect(screen.getByText('Pottery class')).toBeInTheDocument();
  });

  it('pages forward and back from the pager', () => {
    const onPageChange = jest.fn();
    render(<DiscoverGrid {...baseProps} page={2} onPageChange={onPageChange} />);

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { unmount } = render(<DiscoverGrid {...baseProps} page={1} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    unmount();

    render(<DiscoverGrid {...baseProps} page={3} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('leaves out the pager when everything fits on one page', () => {
    render(<DiscoverGrid {...baseProps} experiences={page} total={2} />);

    expect(
      screen.queryByRole('navigation', { name: 'Discover experiences pages' }),
    ).not.toBeInTheDocument();
  });

  it('hides the whole section when it loaded empty', () => {
    const { container } = render(<DiscoverGrid {...baseProps} experiences={[]} total={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('keeps the section while loading, with no count yet', () => {
    render(<DiscoverGrid {...baseProps} experiences={[]} total={0} isLoading />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Discover experiences');
    expect(screen.queryByText(/^\d+ experiences?$/)).not.toBeInTheDocument();
  });
});
