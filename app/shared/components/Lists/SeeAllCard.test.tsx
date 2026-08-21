import React from 'react';

import { render, screen } from '@testing-library/react';

import { SeeAllCard } from './SeeAllCard';

jest.mock('next/image', () => {
  function MockImage({ alt, src }: Record<string, unknown>) {
    return <img alt={alt as string} src={src as string} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
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

describe('SeeAllCard', () => {
  it('links to the destination with a See All label', () => {
    render(<SeeAllCard href="/experiences/see-all?type=today" />);

    const link = screen.getByRole('link', { name: /See All/ });
    expect(link).toHaveAttribute('href', '/experiences/see-all?type=today');
  });

  // The preview is decorative — the link already carries its own label — so it
  // has an empty alt and is exposed as presentation, not an image
  it('previews a photo from the row it closes', () => {
    const { container } = render(
      <SeeAllCard href="/places" previewPhotos={['https://cdn.tukai.co/a.jpg']} />,
    );

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.tukai.co/a.jpg');
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  // Three photos fan out: the first sits centred and on top, the next two
  // behind it to either side
  it('fans up to three photos around the centred one', () => {
    const { container } = render(
      <SeeAllCard
        href="/places"
        previewPhotos={[
          'https://cdn.tukai.co/a.jpg',
          'https://cdn.tukai.co/b.jpg',
          'https://cdn.tukai.co/c.jpg',
        ]}
      />,
    );

    const sources = Array.from(container.querySelectorAll('img')).map((image) =>
      image.getAttribute('src'),
    );
    expect(sources).toHaveLength(3);
    expect(sources).toEqual(
      expect.arrayContaining([
        'https://cdn.tukai.co/a.jpg',
        'https://cdn.tukai.co/b.jpg',
        'https://cdn.tukai.co/c.jpg',
      ]),
    );
  });

  it('ignores extra photos beyond the third', () => {
    const { container } = render(
      <SeeAllCard href="/places" previewPhotos={['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg']} />,
    );

    expect(container.querySelectorAll('img')).toHaveLength(3);
  });

  // Rows can hand over items whose photo is missing; those must not render as
  // broken tiles or shift the fan
  it('skips missing photos rather than rendering empty tiles', () => {
    const { container } = render(
      <SeeAllCard href="/places" previewPhotos={[null, 'b.jpg', undefined, '']} />,
    );

    const sources = Array.from(container.querySelectorAll('img')).map((image) =>
      image.getAttribute('src'),
    );
    expect(sources).toEqual(['b.jpg']);
  });

  it('renders a plain tile when there is no photo', () => {
    const { container } = render(<SeeAllCard href="/places" previewPhotos={[]} />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByText('See All')).toBeInTheDocument();
  });

  // Rows have different card widths, so the tile has to match its neighbours
  it('takes the row card width', () => {
    render(<SeeAllCard href="/places" className="w-[240px]" />);

    expect(screen.getByRole('link')).toHaveClass('w-[240px]');
  });

  it('defaults to the standard row card width', () => {
    render(<SeeAllCard href="/places" />);

    expect(screen.getByRole('link')).toHaveClass('w-[280px]');
  });

  // It must match the height of the cards' IMAGES, not the whole card —
  // stretching would run it past the titles and prices beneath them
  it('matches the 4:3 card image and does not stretch to the row height', () => {
    render(<SeeAllCard href="/places" />);
    const link = screen.getByRole('link');

    expect(link).toHaveClass('aspect-[4/3]', 'self-start');
  });

  it('lets a row with a different image height override the aspect', () => {
    render(<SeeAllCard href="/places" className="aspect-auto h-[130px] w-[240px]" />);
    const link = screen.getByRole('link');

    expect(link).toHaveClass('aspect-auto', 'h-[130px]', 'w-[240px]');
    expect(link).not.toHaveClass('aspect-[4/3]');
  });

  it('carries a drop shadow', () => {
    render(<SeeAllCard href="/places" />);

    expect(screen.getByRole('link').className).toMatch(/shadow-\[/);
  });
});
