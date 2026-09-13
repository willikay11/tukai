import React from 'react';

import { act, render, screen } from '@testing-library/react';

import { RevealOnScroll } from './RevealOnScroll';

const observe = jest.fn();
const disconnect = jest.fn();
let trigger: ((entries: { isIntersecting: boolean }[]) => void) | null = null;

const originalObserver = global.IntersectionObserver;

const installObserver = () => {
  // @ts-expect-error — a stand-in for the browser's observer
  global.IntersectionObserver = class {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      trigger = callback;
    }
    observe = observe;
    disconnect = disconnect;
  };
};

describe('RevealOnScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    trigger = null;
    installObserver();
  });

  afterEach(() => {
    global.IntersectionObserver = originalObserver;
  });

  it('renders its children either way — the animation is decoration', () => {
    render(
      <RevealOnScroll>
        <p>Cancellation Policy</p>
      </RevealOnScroll>,
    );

    expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
  });

  it('starts hidden and reveals once the section comes into view', () => {
    const { container } = render(
      <RevealOnScroll>
        <p>Where we meet</p>
      </RevealOnScroll>,
    );
    const wrapper = container.firstElementChild;

    expect(wrapper).toHaveClass('opacity-0');

    act(() => trigger?.([{ isIntersecting: true }]));

    expect(wrapper).toHaveClass('opacity-100');
  });

  // Re-animating on the way back up reads as a glitch
  it('stops watching once it has revealed', () => {
    render(
      <RevealOnScroll>
        <p>Where we meet</p>
      </RevealOnScroll>,
    );

    act(() => trigger?.([{ isIntersecting: true }]));

    expect(disconnect).toHaveBeenCalled();
  });

  it('ignores an element that has not reached the viewport', () => {
    const { container } = render(
      <RevealOnScroll>
        <p>Where we meet</p>
      </RevealOnScroll>,
    );

    act(() => trigger?.([{ isIntersecting: false }]));

    expect(container.firstElementChild).toHaveClass('opacity-0');
  });

  // No observer means no way to know — showing the content beats hiding it
  it('renders revealed where IntersectionObserver is unavailable', () => {
    // @ts-expect-error — removing it for this case
    global.IntersectionObserver = undefined;

    const { container } = render(
      <RevealOnScroll>
        <p>Where we meet</p>
      </RevealOnScroll>,
    );

    expect(container.firstElementChild).toHaveClass('opacity-100');
  });
});
