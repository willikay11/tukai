import React from 'react';

import { act, render, screen } from '@testing-library/react';

import { RotatingPlaceholder } from './RotatingPlaceholder';

const PHRASES = ['Find experiences', 'Find places', 'Find communities', 'Find activities'];

const reel = (container: HTMLElement) => container.querySelector('[style*="translateY"]');
const offsetOf = (container: HTMLElement) =>
  (reel(container) as HTMLElement)?.style.transform ?? '';

describe('RotatingPlaceholder', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const advance = (ms: number) => act(() => void jest.advanceTimersByTime(ms));

  it('lists every phrase in order', () => {
    render(<RotatingPlaceholder visible />);

    PHRASES.forEach((phrase) => expect(screen.getAllByText(phrase).length).toBeGreaterThan(0));
  });

  it('starts on the first phrase', () => {
    const { container } = render(<RotatingPlaceholder visible />);

    expect(offsetOf(container)).toBe('translateY(-0px)');
  });

  // Each step scrolls the reel up by exactly one line box, so the current
  // phrase leaves upward and the next rises in behind it
  it('scrolls up one slot per step', () => {
    const { container } = render(<RotatingPlaceholder visible />);

    advance(2500);
    expect(offsetOf(container)).toBe('translateY(-18px)');

    advance(2500);
    expect(offsetOf(container)).toBe('translateY(-36px)');
  });

  // The first phrase is repeated at the end so the wrap slides the same way as
  // every other step, then the reel jumps back invisibly
  it('repeats the first phrase at the end of the reel', () => {
    render(<RotatingPlaceholder visible />);

    expect(screen.getAllByText('Find experiences')).toHaveLength(2);
    expect(screen.getAllByText('Find places')).toHaveLength(1);
  });

  it('returns to the start after the final phrase, without scrolling back', () => {
    const { container } = render(<RotatingPlaceholder visible />);

    // Step onto the duplicated first slot
    advance(2500 * 4);
    expect(offsetOf(container)).toBe(`translateY(-${18 * 4}px)`);

    // ...then it snaps home once the slide has finished
    advance(500);
    expect(offsetOf(container)).toBe('translateY(-0px)');
  });

  it('animates the slide but not the snap back', () => {
    const { container } = render(<RotatingPlaceholder visible />);

    expect(reel(container)).toHaveClass('transition-transform');

    advance(2500 * 4);
    advance(500);
    expect(reel(container)).not.toHaveClass('transition-transform');
  });

  // The field's own text must never have the reel sitting behind it
  it('renders nothing once the field has text', () => {
    const { container } = render(<RotatingPlaceholder visible={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('stops advancing while hidden', () => {
    const { container, rerender } = render(<RotatingPlaceholder visible />);

    rerender(<RotatingPlaceholder visible={false} />);
    advance(2500 * 3);
    rerender(<RotatingPlaceholder visible />);

    expect(offsetOf(container)).toBe('translateY(-0px)');
  });

  // The input carries the accessible name; this is decoration over it
  it('is hidden from assistive tech', () => {
    const { container } = render(<RotatingPlaceholder visible />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('takes a caller phrase list', () => {
    render(<RotatingPlaceholder visible phrases={['Find hikes']} />);

    expect(screen.getAllByText('Find hikes')).toHaveLength(2);
  });
});
