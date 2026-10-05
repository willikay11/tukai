import React from 'react';

import { act, render, screen } from '@testing-library/react';

import { useRailPaging } from './useRailPaging';

/** jsdom lays nothing out, so the rail's geometry is set by hand. */
const Probe = ({ scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number }) => {
  const { ref, atStart, atEnd, onBack, onNext } = useRailPaging<HTMLDivElement>();

  React.useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    Object.defineProperty(rail, 'scrollWidth', { value: scrollWidth, configurable: true });
    Object.defineProperty(rail, 'clientWidth', { value: clientWidth, configurable: true });
    rail.scrollBy = jest.fn();
    rail.dispatchEvent(new Event('scroll'));
  }, [ref, scrollWidth, clientWidth]);

  return (
    <div>
      <p data-testid="state">{`${atStart}|${atEnd}`}</p>
      <button onClick={onBack}>back</button>
      <button onClick={onNext}>next</button>
      <div ref={ref} data-testid="rail" />
    </div>
  );
};

const stateOf = () => screen.getByTestId('state').textContent;

describe('useRailPaging', () => {
  it('starts at the start', () => {
    render(<Probe scrollWidth={1000} clientWidth={400} />);

    expect(stateOf()).toBe('true|false');
  });

  /**
   * A rail with nothing to scroll is at both ends at once, which is what greys
   * both arrows rather than offering a page that goes nowhere.
   */
  it('is at both ends when there is nothing to scroll', () => {
    render(<Probe scrollWidth={400} clientWidth={400} />);

    expect(stateOf()).toBe('true|true');
  });

  it('knows when it has reached the end', () => {
    render(<Probe scrollWidth={1000} clientWidth={400} />);
    const rail = screen.getByTestId('rail');

    act(() => {
      rail.scrollLeft = 600;
      rail.dispatchEvent(new Event('scroll'));
    });

    expect(stateOf()).toBe('false|true');
  });

  it('is at neither end in the middle', () => {
    render(<Probe scrollWidth={1000} clientWidth={400} />);
    const rail = screen.getByTestId('rail');

    act(() => {
      rail.scrollLeft = 200;
      rail.dispatchEvent(new Event('scroll'));
    });

    expect(stateOf()).toBe('false|false');
  });

  // Just under a full width, so the card at the edge stays in view
  it('pages by most of a width, in both directions', () => {
    render(<Probe scrollWidth={1000} clientWidth={400} />);
    const rail = screen.getByTestId('rail');

    screen.getByText('next').click();
    expect(rail.scrollBy).toHaveBeenCalledWith({ left: 360, behavior: 'smooth' });

    screen.getByText('back').click();
    expect(rail.scrollBy).toHaveBeenCalledWith({ left: -360, behavior: 'smooth' });
  });
});
