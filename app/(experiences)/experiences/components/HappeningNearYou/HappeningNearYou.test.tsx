import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { HappeningNearYou } from './index';

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

const firstPage = [experience('1', 'Lake walk'), experience('2', 'Pottery class')];

const baseProps = {
  experiences: firstPage,
  total: 14,
  hasMore: true,
  isLoading: false,
  isExpanded: false,
  onToggle: jest.fn(),
};

describe('HappeningNearYou', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses a sentence-case heading and a subtitle with no city', () => {
    render(<HappeningNearYou {...baseProps} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^Happening near you$/);
    expect(screen.getByText('Within 25 km')).toBeInTheDocument();
    expect(screen.queryByText(/of /)).not.toBeInTheDocument();
  });

  it('names the API total on the toggle while collapsed', () => {
    render(<HappeningNearYou {...baseProps} />);

    const toggle = screen.getByRole('button', { name: 'All 14' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onToggle when the toggle is pressed', () => {
    render(<HappeningNearYou {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'All 14' }));
    expect(baseProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows See less and every experience once expanded', () => {
    const everything = [...firstPage, experience('3', 'Night market')];
    render(<HappeningNearYou {...baseProps} experiences={everything} isExpanded />);

    expect(screen.getByRole('button', { name: 'See less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Night market')).toBeInTheDocument();
  });

  it('leaves out the toggle when the API holds no more than the page', () => {
    render(<HappeningNearYou {...baseProps} total={2} hasMore={false} />);

    expect(screen.queryByRole('button', { name: /All/ })).not.toBeInTheDocument();
  });

  it('keeps See less when expanded, even with nothing more to reveal', () => {
    render(<HappeningNearYou {...baseProps} hasMore={false} isExpanded />);

    expect(screen.getByRole('button', { name: 'See less' })).toBeInTheDocument();
  });

  it('hides the whole section when it loaded empty', () => {
    const { container } = render(
      <HappeningNearYou {...baseProps} experiences={[]} total={0} hasMore={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('keeps the section while loading, even with nothing to show yet', () => {
    render(
      <HappeningNearYou {...baseProps} experiences={[]} total={0} isLoading hasMore={false} />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Happening near you');
    expect(screen.queryByText('Lake walk')).not.toBeInTheDocument();
  });
});
