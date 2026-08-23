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

  // A page that fits the viewport is never "at the bottom" for spy purposes —
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

  // A short final section may never reach the line — its tab must still light
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
    // has not become current yet — with no offset it would have
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

    // The scroll lands — 'members' is now at the top
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
});
