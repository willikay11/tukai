import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SectionHeader } from './index';

jest.mock('next/link', () => {
  // Forwards every prop, so class-based assertions see what the header renders
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

describe('SectionHeader', () => {
  // Regression: the five existing usages pass no icon
  it('renders title, subtitle and See all without an icon', () => {
    render(<SectionHeader title="Happening Today" subtitle="Thursday" seeAllHref="/experiences" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Happening Today');
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/experiences');
    expect(screen.queryByTestId('Compass01Icon')).not.toBeInTheDocument();
  });

  // Beside the title from sm up, stacked under it on a phone - a long title
  // and subtitle side by side overflow a narrow screen
  // The canvas always sets the subtitle under the title, at any width
  it('sets the subtitle under the title', () => {
    const { container } = render(
      <SectionHeader title="Moments" subtitle="Fresh from the community" />,
    );

    const titleGroup = container.querySelector('.flex.flex-col');
    expect(titleGroup).toContainElement(screen.getByRole('heading', { level: 2 }));
    expect(titleGroup).toContainElement(screen.getByText('Fresh from the community'));

    expect(titleGroup).not.toHaveClass('sm:flex-row');
  });

  // Without min-w-0 a long title pushes the "See all" link off the row
  it('lets a long title shrink rather than overflow', () => {
    const { container } = render(
      <SectionHeader title="An extremely long section title that will not fit" seeAllHref="/x" />,
    );

    expect(container.querySelector('.min-w-0')).toBeInTheDocument();
  });

  /**
   * The canvas's header carries no icon. The tile survives only for the
   * communities category groups, which stack one above their title.
   */
  it('draws no icon on a row section, even when one is passed', () => {
    render(
      <SectionHeader
        icon="Compass01Icon"
        title="Discover Experiences"
        subtitle="Handpicked for you"
      />,
    );

    expect(screen.queryByTestId('Compass01Icon')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Discover Experiences');
    expect(screen.getByText('Handpicked for you')).toBeInTheDocument();
  });

  it('defaults the icon circle to the brand tint', () => {
    const { container } = render(
      <SectionHeader icon="Compass01Icon" title="Discover" layout="stacked" />,
    );

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
        layout="stacked"
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

  /**
   * The canvas replaces the "See all" link with two circular arrows that page
   * the rail, and greys each one at its end.
   */
  describe('paging arrows', () => {
    const paging = {
      onBack: jest.fn(),
      onNext: jest.fn(),
      railLabel: 'promoted places',
    };

    beforeEach(() => jest.clearAllMocks());

    it('draws arrows when the rail can be paged', () => {
      render(<SectionHeader title="Promoted places" {...paging} atStart atEnd={false} />);

      expect(screen.getByRole('button', { name: 'Previous promoted places' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next promoted places' })).toBeInTheDocument();
    });

    it('greys the back arrow at the start and the next one at the end', () => {
      const { rerender } = render(
        <SectionHeader title="Promoted places" {...paging} atStart atEnd={false} />,
      );

      expect(screen.getByRole('button', { name: /^Previous/ })).toBeDisabled();
      expect(screen.getByRole('button', { name: /^Next/ })).toBeEnabled();

      rerender(<SectionHeader title="Promoted places" {...paging} atStart={false} atEnd />);

      expect(screen.getByRole('button', { name: /^Previous/ })).toBeEnabled();
      expect(screen.getByRole('button', { name: /^Next/ })).toBeDisabled();
    });

    it('pages the rail', async () => {
      render(<SectionHeader title="Promoted places" {...paging} atStart={false} atEnd={false} />);

      await userEvent.click(screen.getByRole('button', { name: /^Next/ }));
      expect(paging.onNext).toHaveBeenCalled();

      await userEvent.click(screen.getByRole('button', { name: /^Previous/ }));
      expect(paging.onBack).toHaveBeenCalled();
    });

    // The link moves to the card at the end of the rail, where the reader runs
    // out of cards
    it('drops the See all link once there are arrows', () => {
      render(
        <SectionHeader title="Promoted places" seeAllHref="/experiences/see-all" {...paging} />,
      );

      expect(screen.queryByRole('link', { name: 'See all' })).not.toBeInTheDocument();
    });

    it('keeps the link on a section with no arrows', () => {
      render(<SectionHeader title="Moments" seeAllHref="/moments" />);

      expect(screen.getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/moments');
    });
  });

  // A section whose rows grow in place has neither arrows nor a page to go to
  describe('a custom action', () => {
    it('takes the place of the See all link', () => {
      render(
        <SectionHeader
          title="Public bucket lists"
          seeAllHref="/somewhere"
          action={<button type="button">View more</button>}
        />,
      );

      expect(screen.getByText('View more')).toBeInTheDocument();
      expect(screen.queryByText('See all')).not.toBeInTheDocument();
    });

    it('takes the place of the arrows', () => {
      render(
        <SectionHeader
          title="Public bucket lists"
          onBack={jest.fn()}
          onNext={jest.fn()}
          action={<button type="button">View more</button>}
        />,
      );

      expect(screen.getByText('View more')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    });
  });

  // Live, an arrow is a filled green disc with no outline; spent, it empties
  // out to a white one behind a hairline
  describe('how an arrow reads', () => {
    const renderArrows = (atStart: boolean, atEnd: boolean) =>
      render(
        <SectionHeader
          title="Promoted places"
          onBack={jest.fn()}
          onNext={jest.fn()}
          atStart={atStart}
          atEnd={atEnd}
        />,
      );

    it('fills the arrow that can still be pressed', () => {
      renderArrows(true, false);

      const next = screen.getByRole('button', { name: /next/i });
      expect(next).toHaveClass('bg-surface-brand');
      expect(next).toHaveClass('text-brand');
      expect(next).not.toHaveClass('border');
    });

    // The design's own values: white behind a hairline at 35%, and it stops
    // taking the pointer rather than only looking inert
    it('empties the one that cannot', () => {
      renderArrows(true, false);

      const back = screen.getByRole('button', { name: /previous/i });
      expect(back).toHaveClass('bg-white');
      expect(back).toHaveClass('border-line');
      expect(back).toHaveClass('opacity-35');
      expect(back).toHaveClass('pointer-events-none');
      expect(back).toBeDisabled();
    });
  });

  it('points the See all link on with a chevron', () => {
    render(<SectionHeader title="Recent moments" seeAllHref="/moments" />);

    const link = screen.getByText('See all').closest('a');
    expect(link).toHaveAttribute('href', '/moments');
    expect(link).toHaveClass('font-bold');
    expect(screen.getByTestId('ArrowRight01Icon')).toBeInTheDocument();
  });
});
