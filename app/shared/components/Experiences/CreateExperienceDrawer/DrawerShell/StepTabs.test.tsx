import { render, screen } from '@testing-library/react';

import type { DrawerStepMeta } from '../useCreateExperienceDrawer';
import { StepTabs } from './StepTabs';

jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));

const steps = [
  { id: 'dateType', label: 'Date type', icon: 'Calendar03Icon' },
  { id: 'about', label: 'About', icon: 'InformationCircleIcon' },
  { id: 'tickets', label: 'Tickets', icon: 'Ticket01Icon' },
  { id: 'wallet', label: 'Wallet details', icon: 'Wallet01Icon' },
] as unknown as DrawerStepMeta[];

// jsdom lays nothing out: give the row a width and each tab a place in it
const TAB_WIDTH = 120;
const GAP = 8;
const NAV_WIDTH = 300;

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
    configurable: true,
    get(this: HTMLElement) {
      const tabs = Array.from(this.parentElement?.children ?? []);
      return 24 + tabs.indexOf(this) * (TAB_WIDTH + GAP);
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => TAB_WIDTH,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => NAV_WIDTH,
  });
});

const scrollTo = jest.fn();
const reducedMotion = (matches: boolean) => {
  window.matchMedia = jest.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
};

const renderTabs = (activeStepIndex: number) => {
  const view = render(
    <StepTabs
      steps={steps}
      activeStepIndex={activeStepIndex}
      reachedStepIndex={activeStepIndex}
      onStepChange={jest.fn()}
    />,
  );
  return {
    ...view,
    goTo: (index: number) =>
      view.rerender(
        <StepTabs
          steps={steps}
          activeStepIndex={index}
          reachedStepIndex={index}
          onStepChange={jest.fn()}
        />,
      ),
  };
};

// DEV-505: on a later step, like Wallet details, the bar stayed scrolled to the start
describe('StepTabs, following the current step', () => {
  beforeEach(() => {
    scrollTo.mockClear();
    HTMLElement.prototype.scrollTo = scrollTo;
    reducedMotion(false);
  });

  it('scrolls the row so the new step is in the middle', () => {
    const { goTo } = renderTabs(0);
    scrollTo.mockClear();

    goTo(3);

    // Wallet's tab starts at 24 + 3 × 128 = 408; centred in 300px is 408 - 90
    expect(scrollTo).toHaveBeenCalledWith({ left: 318, behavior: 'smooth' });
    expect(screen.getByRole('button', { name: 'Wallet details' })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('goes back to the start for the first step, never past it', () => {
    const { goTo } = renderTabs(3);
    goTo(0);

    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' });
  });

  it('jumps without animating for reduced motion', () => {
    reducedMotion(true);
    renderTabs(2);

    expect(scrollTo).toHaveBeenCalledWith({ left: 190, behavior: 'auto' });
  });

  it('only scrolls when the step changes', () => {
    const { rerender } = renderTabs(1);
    scrollTo.mockClear();

    rerender(
      <StepTabs steps={steps} activeStepIndex={1} reachedStepIndex={2} onStepChange={jest.fn()} />,
    );

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
