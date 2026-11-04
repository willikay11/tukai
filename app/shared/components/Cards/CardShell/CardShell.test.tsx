import React from 'react';
import { createPortal } from 'react-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CardShell } from './index';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, priority }: Record<string, unknown>) => (
    <img alt={alt as string} data-priority={String(priority)} />
  ),
}));

describe('CardShell', () => {
  const media = { src: 'https://cdn/a.jpg', alt: 'A hike', sizes: '280px' };

  it('is a link when given a href', () => {
    render(
      <CardShell {...media} href="/places/kraftory">
        <p>Kraftory</p>
      </CardShell>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/places/kraftory');
  });

  it('handles a press itself when given no href', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<CardShell {...media} onClick={onClick} />);

    await user.click(screen.getByAltText('A hike'));

    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  /**
   * The bookmark's bucket-list picker portals out of the card, but React still
   * bubbles its events through it - pressing "Create bucket list" opened the
   * place drawer over the picker.
   */
  describe('with something portalled out of an overlay', () => {
    const portalled = (
      <>
        {createPortal(
          <>
            <button type="button">Create bucket list</button>
            <input aria-label="List name" />
          </>,
          document.body,
        )}
      </>
    );

    it('does not treat a press inside the portal as a press on the card', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<CardShell {...media} onClick={onClick} overlay={portalled} />);

      await user.click(screen.getByRole('button', { name: 'Create bucket list' }));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not let a portal press reach a link card either', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(
        <CardShell {...media} href="/experiences/hike" onClick={onClick} overlay={portalled} />,
      );

      await user.click(screen.getByRole('button', { name: 'Create bucket list' }));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('lets a space be typed into a field inside the portal', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<CardShell {...media} onClick={onClick} overlay={portalled} />);

      await user.type(screen.getByRole('textbox', { name: 'List name' }), 'Road trip');

      expect(screen.getByRole('textbox', { name: 'List name' })).toHaveValue('Road trip');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('still opens on a press of the card itself', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<CardShell {...media} onClick={onClick} overlay={portalled} />);

      await user.click(screen.getByAltText('A hike'));

      expect(onClick).toHaveBeenCalled();
    });
  });

  /**
   * The canvas draws card media square - 33 of its 40 ratios are 1:1, where
   * ours are 4:3. The default keeps today's shape so adopting the shell moves
   * nothing; each screen's own task flips it as that screen is diffed.
   */
  it('keeps 4:3 by default, so adopting it changes nothing', () => {
    const { container } = render(<CardShell {...media} />);

    expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeInTheDocument();
  });

  it.each([
    ['square', 'aspect-square'],
    ['16/9', 'aspect-\\[16\\/9\\]'],
  ])('takes %s when a screen asks for it', (ratio, expected) => {
    const { container } = render(<CardShell {...media} ratio={ratio as 'square'} />);

    expect(container.querySelector('.' + expected)).toBeInTheDocument();
  });

  it('clips the media box, so a zooming photo stays inside its corners', () => {
    const { container } = render(<CardShell {...media} />);
    const box = container.querySelector('.aspect-\\[4\\/3\\]');

    expect(box?.className).toContain('overflow-hidden');
    expect(box?.className).toContain('rounded-2xl');
  });

  it('lays overlays over the photo and the body beneath it', () => {
    render(
      <CardShell {...media} overlay={<span>bookmark</span>}>
        <p>body</p>
      </CardShell>,
    );

    expect(screen.getByText('bookmark')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('passes priority through for a tile above the fold', () => {
    render(<CardShell {...media} priority />);

    expect(screen.getByAltText('A hike')).toHaveAttribute('data-priority', 'true');
  });

  // The photo and the title sit in separate wrappers and both react to a hover
  // anywhere on the tile, so the group has to be on the outside
  it('carries the hover group on the outer element', () => {
    const { container } = render(<CardShell {...media} href="/x" />);

    expect(container.firstElementChild?.className).toContain('group');
  });
});
