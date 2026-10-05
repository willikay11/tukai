import { act, renderHook } from '@testing-library/react';

import { useScrollSpy } from './useScrollSpy';

const IDS = ['about', 'experiences', 'members'];

// Each section reports where its top sits relative to the viewport
const placeSections = (tops: Record<string, number>) => {
  document.body.innerHTML = IDS.map((id) => `<div id="${id}"></div>`).join('');
  IDS.forEach((id) => {
    const element = document.getElementById(id)!;
    element.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect;
    element.scrollIntoView = jest.fn();
  });
};

const scroll = () => act(() => void window.dispatchEvent(new Event('scroll')));

describe('useScrollSpy', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  // A page that fits the viewport is never "at the bottom" for spy purposes -
  // otherwise its last section would always read as current
  it('does not jump to the last section on a page that does not scroll', () => {
    placeSections({ about: 0, experiences: 500, members: 1000 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 400, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

    const { result } = renderHook(() => useScrollSpy(IDS));
    scroll();

    expect(result.current.activeId).toBe('about');
  });

  it('starts on the first section', () => {
    placeSections({ about: 0, experiences: 500, members: 1000 });

    const { result } = renderHook(() => useScrollSpy(IDS));

    expect(result.current.activeId).toBe('about');
  });

  // Before any section has reached the offset line, the first is still current
  it('keeps the first section active while the reader is above it', () => {
    placeSections({ about: 300, experiences: 800, members: 1300 });

    const { result } = renderHook(() => useScrollSpy(IDS));
    scroll();

    expect(result.current.activeId).toBe('about');
  });

  it('advances to the last section that has passed the offset', () => {
    placeSections({ about: -400, experiences: -50, members: 600 });

    const { result } = renderHook(() => useScrollSpy(IDS));
    scroll();

    expect(result.current.activeId).toBe('experiences');
  });

  // A short final section may never reach the line - its tab must still light
  // up when the reader hits the bottom
  it('activates the last section at the bottom of the page', () => {
    placeSections({ about: -900, experiences: -600, members: 400 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 1200, configurable: true });

    const { result } = renderHook(() => useScrollSpy(IDS));
    scroll();

    expect(result.current.activeId).toBe('members');
  });

  it('respects the offset for a sticky header', () => {
    // 'experiences' sits 150px down, still below the 96px offset line, so it
    // has not become current yet - with no offset it would have
    placeSections({ about: -200, experiences: 150, members: 700 });

    const { result } = renderHook(() => useScrollSpy(IDS, 96));
    scroll();

    expect(result.current.activeId).toBe('about');

    const { result: noOffset } = renderHook(() => useScrollSpy(IDS, 0));
    scroll();

    expect(noOffset.current.activeId).toBe('about');
  });

  it('scrolls to a section and marks it active', () => {
    placeSections({ about: 0, experiences: 500, members: 1000 });

    const { result } = renderHook(() => useScrollSpy(IDS));
    act(() => result.current.scrollTo('members'));

    expect(document.getElementById('members')!.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    expect(result.current.activeId).toBe('members');
  });

  // Scroll events fire all the way to the target; the picked pill must not
  // flicker back to whatever section the page is passing through
  it('holds the picked section while the scroll is in flight', () => {
    placeSections({ about: 0, experiences: 500, members: 1000 });

    const { result } = renderHook(() => useScrollSpy(IDS));
    act(() => result.current.scrollTo('members'));
    expect(result.current.activeId).toBe('members');

    // Mid-flight: the page is still up at 'about'
    scroll();
    expect(result.current.activeId).toBe('members');
  });

  it('releases the hold once the scroll arrives', () => {
    placeSections({ about: 0, experiences: 500, members: 1000 });

    const { result } = renderHook(() => useScrollSpy(IDS));
    act(() => result.current.scrollTo('members'));

    // The scroll lands - 'members' is now at the top
    placeSections({ about: -1000, experiences: -500, members: -10 });
    scroll();
    expect(result.current.activeId).toBe('members');

    // and normal spying resumes
    placeSections({ about: -400, experiences: -50, members: 600 });
    scroll();
    expect(result.current.activeId).toBe('experiences');
  });

  it('ignores a request for a section that is not on the page', () => {
    placeSections({ about: 0, experiences: 500, members: 1000 });

    const { result } = renderHook(() => useScrollSpy(IDS));
    act(() => result.current.scrollTo('nowhere'));

    expect(result.current.activeId).toBe('about');
  });

  it('copes with no sections', () => {
    const { result } = renderHook(() => useScrollSpy([]));

    expect(result.current.activeId).toBe('');
  });

  it('stops listening when unmounted', () => {
    placeSections({ about: 0, experiences: 500, members: 1000 });
    const removeListener = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollSpy(IDS));
    unmount();

    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeListener.mockRestore();
  });

  /**
   * A drawer scrolls its own body, and the window fires no scroll event for
   * it. Passing the ELEMENT rather than a ref to it is what makes this work:
   * the panel mounts after the first render, and a ref object never changes
   * identity, so the effect would have attached to the window and stayed
   * there.
   */
  describe('inside a scrolling container', () => {
    const buildPanel = (tops: Record<string, number>) => {
      document.body.innerHTML = `<div id="panel">${IDS.map((id) => `<div id="${id}"></div>`).join(
        '',
      )}</div>`;

      const panel = document.getElementById('panel') as HTMLElement;
      panel.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
      Object.defineProperty(panel, 'scrollHeight', { value: 2000, configurable: true });
      Object.defineProperty(panel, 'clientHeight', { value: 800, configurable: true });
      Object.defineProperty(panel, 'scrollTop', { value: 0, configurable: true, writable: true });

      IDS.forEach((id) => {
        const element = document.getElementById(id)!;
        element.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect;
        element.scrollIntoView = jest.fn();
      });

      return panel;
    };

    const scrollPanel = (panel: HTMLElement) =>
      act(() => void panel.dispatchEvent(new Event('scroll')));

    it('follows the container’s own scroll, not the window’s', () => {
      const panel = buildPanel({ about: -600, experiences: -10, members: 900 });

      const { result } = renderHook(() => useScrollSpy(IDS, 0, panel));
      scrollPanel(panel);

      expect(result.current.activeId).toBe('experiences');
    });

    // The panel only exists once the drawer opens; before that there is
    // nothing to watch, and it has to start watching when it arrives
    it('picks the container up when it mounts after the first render', () => {
      const panel = buildPanel({ about: -600, experiences: -10, members: 900 });

      const { result, rerender } = renderHook(
        ({ container }: { container: HTMLElement | null }) => useScrollSpy(IDS, 0, container),
        { initialProps: { container: null as HTMLElement | null } },
      );

      rerender({ container: panel });
      scrollPanel(panel);

      expect(result.current.activeId).toBe('experiences');
    });

    it('measures each section against the container, not the viewport', () => {
      // The container starts 200px down the page, so a section sitting 210px
      // down the viewport is still 10px below the container's own top - it has
      // not been reached, however far down the window it looks
      const panel = buildPanel({ about: 10, experiences: 210, members: 900 });
      panel.getBoundingClientRect = () => ({ top: 200 }) as DOMRect;

      const { result } = renderHook(() => useScrollSpy(IDS, 0, panel));
      scrollPanel(panel);

      expect(result.current.activeId).toBe('about');
    });

    it('scrolls to a section inside the container', () => {
      const panel = buildPanel({ about: 0, experiences: 500, members: 1000 });

      const { result } = renderHook(() => useScrollSpy(IDS, 0, panel));
      act(() => result.current.scrollTo('members'));

      expect(document.getElementById('members')!.scrollIntoView).toHaveBeenCalled();
      expect(result.current.activeId).toBe('members');
    });
  });
});
