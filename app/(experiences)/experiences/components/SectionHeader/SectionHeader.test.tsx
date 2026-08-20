import { render, screen } from '@testing-library/react';

import { SectionHeader } from './index';

jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('SectionHeader', () => {
  // Regression: the five existing usages pass no icon
  it('renders title, subtitle and See all without an icon', () => {
    render(
      <SectionHeader title="Happening Today" subtitle="Thursday" seeAllHref="/experiences" />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Happening Today');
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/experiences');
    expect(screen.queryByTestId('Compass01Icon')).not.toBeInTheDocument();
  });

  it('keeps the subtitle inline beside the title, with or without an icon', () => {
    const { container } = render(
      <SectionHeader icon="Compass01Icon" title="Moments" subtitle="Fresh from the community" />,
    );

    // Same baseline row as the icon-less usages on /experiences
    const inlineRow = container.querySelector('.flex.items-baseline');
    expect(inlineRow).toContainElement(screen.getByRole('heading', { level: 2 }));
    expect(inlineRow).toContainElement(screen.getByText('Fresh from the community'));
  });

  it('renders a leading icon in a pale circle when given', () => {
    render(
      <SectionHeader
        icon="Compass01Icon"
        title="Discover Experiences"
        subtitle="Handpicked for you"
      />,
    );

    expect(screen.getByTestId('Compass01Icon')).toHaveClass('text-primary');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Discover Experiences');
    expect(screen.getByText('Handpicked for you')).toBeInTheDocument();
  });

  it('defaults the icon circle to the brand tint', () => {
    const { container } = render(<SectionHeader icon="Compass01Icon" title="Discover" />);

    expect(container.querySelector('.bg-primary\\/10')).toBeInTheDocument();
    expect(screen.getByTestId('Compass01Icon')).toHaveClass('text-primary');
  });

  it('accepts a per-section icon tint', () => {
    const { container } = render(
      <SectionHeader
        icon="Fire03Icon"
        iconBgClass="bg-red-100"
        iconColorClass="text-red-500"
        title="Popular Places"
      />,
    );

    expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    expect(container.querySelector('.bg-primary\\/10')).not.toBeInTheDocument();
    expect(screen.getByTestId('Fire03Icon')).toHaveClass('text-red-500');
  });

  it('omits See all when no href is given', () => {
    render(<SectionHeader icon="Compass01Icon" title="Discover Experiences" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
