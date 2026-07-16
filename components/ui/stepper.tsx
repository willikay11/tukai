'use client';

import type {
  ButtonHTMLAttributes,
  ComponentProps,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import * as Stepperize from '@stepperize/react';

import { cn } from '@/lib/utils';

type StepperOrientation = 'horizontal' | 'vertical';

type StepState = 'active' | 'completed' | 'inactive' | 'loading';

type StepIndicators = {
  active?: ReactNode;
  completed?: ReactNode;
  inactive?: ReactNode;
  loading?: ReactNode;
};

export type StepDefinition = {
  id: string;
  title?: string;
  description?: string;
  icon?: ReactElement;
};

// -----------------------------------------------------------------------------
// Context Types
// -----------------------------------------------------------------------------

interface StepperContextValue {
  stepper: ReturnType<ReturnType<typeof Stepperize.defineStepper>['useStepper']>;

  steps: StepDefinition[];

  orientation: StepperOrientation;
  configOrientation: StepperOrientation;
  responsive: boolean;

  indicators: StepIndicators;

  registerTrigger: (node: HTMLButtonElement | null, remove?: boolean) => void;

  triggerNodes: HTMLButtonElement[];

  focusNext: (index: number) => void;
  focusPrev: (index: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
}

interface StepItemContextValue {
  step: StepDefinition;
  index: number;
  state: StepState;
  isDisabled: boolean;
  isLoading: boolean;
}

// -----------------------------------------------------------------------------
// Contexts
// -----------------------------------------------------------------------------

const StepperContext = createContext<StepperContextValue | null>(null);
const StepItemContext = createContext<StepItemContextValue | null>(null);

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

export function useStepper() {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error('useStepper must be used within <Stepper />');
  }

  return context;
}

export function useStepItem() {
  const context = useContext(StepItemContext);

  if (!context) {
    throw new Error('useStepItem must be used within <StepperItem />');
  }

  return context;
}

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: StepDefinition[];

  defaultValue?: string;

  orientation?: StepperOrientation;

  responsive?: boolean;

  indicators?: StepIndicators;

  value?: string;

  onValueChange?: (value: string) => void;
}

function Stepper({
  steps,
  defaultValue,
  orientation = 'horizontal',
  responsive = false,
  indicators = {},
  value,
  onValueChange,
  className,
  children,
  ...props
}: StepperProps) {
  /**
   * Stepperize definition
   */
  const definitionRef = useRef<ReturnType<typeof Stepperize.defineStepper> | null>(null);

  if (!definitionRef.current) {
    definitionRef.current = Stepperize.defineStepper(...steps);
  }

  const stepper = definitionRef.current.useStepper({
    initialStep: defaultValue ?? steps[0].id,
  });

  /**
   * Trigger registration
   */
  const [triggerNodes, setTriggerNodes] = useState<HTMLButtonElement[]>([]);

  const registerTrigger = useCallback((node: HTMLButtonElement | null, remove = false) => {
    if (!node) return;

    setTriggerNodes((prev) => {
      if (remove) {
        return prev.filter((item) => item !== node);
      }

      if (prev.includes(node)) {
        return prev;
      }

      return [...prev, node];
    });
  }, []);

  /**
   * Responsive orientation
   */
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.matchMedia('(min-width:768px)').matches;
  });

  useEffect(() => {
    if (!responsive) return;

    const media = window.matchMedia('(min-width:768px)');

    const listener = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [responsive]);

  const effectiveOrientation =
    responsive && orientation === 'horizontal'
      ? isDesktop
        ? 'horizontal'
        : 'vertical'
      : orientation;

  /**
   * Keyboard navigation
   */
  const focusNext = useCallback(
    (index: number) => {
      triggerNodes[(index + 1) % triggerNodes.length]?.focus();
    },
    [triggerNodes],
  );

  const focusPrev = useCallback(
    (index: number) => {
      triggerNodes[(index - 1 + triggerNodes.length) % triggerNodes.length]?.focus();
    },
    [triggerNodes],
  );

  const focusFirst = useCallback(() => {
    triggerNodes[0]?.focus();
  }, [triggerNodes]);

  const focusLast = useCallback(() => {
    triggerNodes[triggerNodes.length - 1]?.focus();
  }, [triggerNodes]);

  /**
   * Controlled mode
   */
  useEffect(() => {
    if (value && value !== stepper.state.current.data.id) {
      stepper.navigation.goTo(value);
    }
  }, [stepper, value]);

  useEffect(() => {
    onValueChange?.(stepper.state.current.data.id);
  }, [stepper.state.current.data.id, onValueChange]);

  const contextValue: StepperContextValue = {
    stepper,

    steps,

    orientation: effectiveOrientation,

    configOrientation: orientation,

    responsive,

    indicators,

    registerTrigger,

    triggerNodes,

    focusNext,

    focusPrev,

    focusFirst,

    focusLast,
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        role="tablist"
        aria-orientation={effectiveOrientation}
        data-slot="stepper"
        data-orientation={effectiveOrientation}
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

interface StepperItemProps extends HTMLAttributes<HTMLDivElement> {
  stepId: string;

  completed?: boolean;

  disabled?: boolean;

  loading?: boolean;
}

function StepperItem({
  stepId,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { stepper, steps } = useStepper();

  const currentIndex = stepper.lookup.getIndex(stepper.state.current.data.id);

  const stepIndex = stepper.lookup.getIndex(stepId);

  const step = steps.find((s) => s.id === stepId)!;

  const state: StepState =
    completed || stepIndex < currentIndex
      ? 'completed'
      : stepIndex === currentIndex
        ? 'active'
        : 'inactive';

  return (
    <StepItemContext.Provider
      value={{
        step,
        index: stepIndex,
        state,
        isDisabled: disabled,
        isLoading: loading && state === 'active',
      }}
    >
      <div
        data-slot="stepper-item"
        data-state={state}
        className={cn('group/step relative flex flex-1 items-start', className)}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  );
}

interface StepperTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function StepperTrigger({ className, children, ...props }: StepperTriggerProps) {
  const { step, state, isDisabled } = useStepItem();

  const { stepper, registerTrigger } = useStepper();

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerTrigger(ref.current);

    return () => registerTrigger(ref.current, true);
  }, [registerTrigger]);

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      data-slot="stepper-trigger"
      data-state={state}
      disabled={isDisabled}
      onClick={() => stepper.navigation.goTo(step.id)}
      className={cn('relative flex w-full flex-col text-center', className)}
      {...props}
    >
      {children}
    </button>
  );
}

interface StepperIndicatorProps extends ComponentProps<'div'> {}

function StepperIndicator({ className, children }: StepperIndicatorProps) {
  const { state, index } = useStepItem();

  return (
    <div
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all',
        state === 'completed' && 'border-primary bg-primary text-primary-foreground',
        state === 'active' &&
          'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
        state === 'inactive' && 'border-muted-foreground/30 bg-background',
        className,
      )}
    >
      {children ?? index + 1}
    </div>
  );
}

function StepperSeparator({ className }: ComponentProps<'div'>) {
  const { state, index } = useStepItem();

  const { steps } = useStepper();

  if (index === steps.length - 1) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute left-0 right-0 top-5 h-0.5 -translate-y-1/2',
        'bg-muted',
        state === 'completed' && 'bg-primary',
        className,
      )}
    />
  );
}

interface StepperTitleProps extends ComponentProps<'h3'> {}

function StepperTitle({ className, children }: StepperTitleProps) {
  const { state } = useStepItem();

  return (
    <h3
      data-slot="stepper-title"
      data-state={state}
      className={cn(
        'mt-3 text-center text-sm font-medium leading-tight',
        'data-[state=inactive]:text-muted-foreground',
        className,
      )}
    >
      {children}
    </h3>
  );
}

interface StepperDescriptionProps extends ComponentProps<'p'> {}

function StepperDescription({ className, children }: StepperDescriptionProps) {
  return (
    <p
      data-slot="stepper-description"
      className={cn('mt-1 text-center text-xs text-muted-foreground', className)}
    >
      {children}
    </p>
  );
}

function StepperNav({ className, children }: ComponentProps<'nav'>) {
  const { orientation, responsive, configOrientation } = useStepper();

  return (
    <nav
      data-slot="stepper-nav"
      data-orientation={orientation}
      className={cn(
        'flex w-full',

        orientation === 'horizontal' ? 'flex-row' : 'flex-col',

        responsive && configOrientation === 'horizontal' && 'flex-col md:flex-row',

        className,
      )}
    >
      {children}
    </nav>
  );
}

function StepperPanel({ className, children }: ComponentProps<'div'>) {
  const { stepper } = useStepper();

  return (
    <div
      data-slot="stepper-panel"
      data-state={stepper.state.current.data.id}
      className={cn('mt-8 w-full', className)}
    >
      {children}
    </div>
  );
}

interface StepperContentProps extends ComponentProps<'div'> {
  value: string;
  forceMount?: boolean;
}

function StepperContent({ value, forceMount, className, children }: StepperContentProps) {
  const { stepper } = useStepper();

  const active = value === stepper.state.current.data.id;

  if (!active && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      hidden={!active}
      id={`stepper-panel-${value}`}
      aria-labelledby={`stepper-tab-${value}`}
      className={cn('mt-8 w-full', !active && forceMount && 'hidden', className)}
    >
      {children}
    </div>
  );
}

export {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperPanel,
  StepperContent,
};