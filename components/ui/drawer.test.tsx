import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Drawer } from './drawer';

const setViewport = (isSheet: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: isSheet,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
};

describe('Drawer', () => {
  beforeEach(() => setViewport(false));

  it('shows nothing until it is opened', () => {
    render(
      <Drawer isOpen={false} setIsOpen={jest.fn()}>
        <p>Pick a list</p>
      </Drawer>,
    );

    expect(screen.queryByText('Pick a list')).not.toBeInTheDocument();
  });

  /**
   * Without a portal, `position: fixed` resolves against the nearest
   * transformed or backdrop-filtered ancestor rather than the viewport. That is
   * why the bucket-list picker would not open on a large screen.
   */
  it('renders outside its own container', () => {
    const { container } = render(
      <div style={{ transform: 'translateZ(0)' }}>
        <Drawer isOpen setIsOpen={jest.fn()}>
          <p>Pick a list</p>
        </Drawer>
      </div>,
    );

    expect(screen.getByText('Pick a list')).toBeInTheDocument();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
  });

  // The canvas: a panel from the right at 720px and up, a sheet below it
  it('is a side panel on a wide viewport', () => {
    render(
      <Drawer isOpen setIsOpen={jest.fn()} width="wide">
        <p>Pick a list</p>
      </Drawer>,
    );

    const panel = document.body.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel.className).toContain('right-0');
    expect(panel.style.width).toBe('760px');
    expect(panel.style.maxWidth).toBe('100vw');
  });

  it('is a bottom sheet on a narrow one', () => {
    setViewport(true);
    render(
      <Drawer isOpen setIsOpen={jest.fn()}>
        <p>Pick a list</p>
      </Drawer>,
    );

    const panel = document.body.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel.className).toContain('inset-x-0');
    expect(panel.className).toContain('rounded-t-18');
  });

  /**
   * A drawer deep enough to be a screen in its own right keeps arriving from
   * the right on a phone and takes the whole viewport, rather than becoming a
   * sheet that spends its height on the page behind it.
   */
  describe('mobile="full"', () => {
    it('is edge to edge on a narrow viewport', () => {
      setViewport(true);
      render(
        <Drawer isOpen setIsOpen={jest.fn()} mobile="full">
          <p>Pick a list</p>
        </Drawer>,
      );

      const panel = document.body.querySelector('[role="dialog"]') as HTMLElement;
      expect(panel.className).toContain('inset-0');
      expect(panel.className).not.toContain('rounded-t-18');
      expect(panel.style.width).toBe('100vw');
    });

    it('is the usual side panel on a wide one', () => {
      render(
        <Drawer isOpen setIsOpen={jest.fn()} width="wide" mobile="full">
          <p>Pick a list</p>
        </Drawer>,
      );

      const panel = document.body.querySelector('[role="dialog"]') as HTMLElement;
      expect(panel.className).toContain('right-0');
      expect(panel.style.width).toBe('760px');
    });

    // Every other drawer keeps the sheet
    it('leaves the default alone', () => {
      setViewport(true);
      render(
        <Drawer isOpen setIsOpen={jest.fn()}>
          <p>Pick a list</p>
        </Drawer>,
      );

      const panel = document.body.querySelector('[role="dialog"]') as HTMLElement;
      expect(panel.className).toContain('rounded-t-18');
    });
  });

  it('closes on the scrim', async () => {
    const setIsOpen = jest.fn();
    const user = userEvent.setup();
    render(
      <Drawer isOpen setIsOpen={setIsOpen}>
        <p>Pick a list</p>
      </Drawer>,
    );

    await user.click(document.body.querySelector('.bg-black\\/50') as HTMLElement);

    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('closes on Escape', () => {
    const setIsOpen = jest.fn();
    render(
      <Drawer isOpen setIsOpen={setIsOpen}>
        <p>Pick a list</p>
      </Drawer>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('holds the page still while it is open, and lets go after', () => {
    const { unmount } = render(
      <Drawer isOpen setIsOpen={jest.fn()}>
        <p>Pick a list</p>
      </Drawer>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
