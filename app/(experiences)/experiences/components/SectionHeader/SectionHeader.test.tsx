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
    render(<SectionHeader title="Happening Today" subtitle="Thursday" seeAllHref="/experiences" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Happening Today');
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/experiences');
    expect(screen.queryByTestId('Compass01Icon')).not.toBeInTheDocument();
  });

  // Beside the title from sm up, stacked under it on a phone — a long title
  // and subtitle side by side overflow a narrow screen
  it('puts the subtitle beside the title from sm up, stacked below it', () => {
    const { container } = render(
      <SectionHeader icon="Compass01Icon" title="Moments" subtitle="Fresh from the community" />,
    );

    const titleGroup = container.querySelector('.flex.flex-col');
    expect(titleGroup).toContainElement(screen.getByRole('heading', { level: 2 }));
    expect(titleGroup).toContainElement(screen.getByText('Fresh from the community'));

    // Stacked by default, inline once there is room
    expect(titleGroup).toHaveClass('sm:flex-row', 'sm:items-baseline');
  });

  // Without min-w-0 a long title pushes the "See all" link off the row
  it('lets a long title shrink rather than overflow', () => {
    const { container } = render(
      <SectionHeader title="An extremely long section title that will not fit" seeAllHref="/x" />,
    );

    expect(container.querySelector('.min-w-0')).toBeInTheDocument();
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
