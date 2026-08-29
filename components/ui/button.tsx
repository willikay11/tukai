import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        'primary-light': 'bg-emerald-100 text-primary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        text: 'hover:text-primary !p-0',
        'primary-text': 'text-primary !p-0',
        gradient: 'bg-gradient-to-b to-[#064E3B] from-[#047857] text-white',
        'outline-primary':
          'rounded-full border border-primary bg-white text-primary hover:bg-primary/5',
        lime: 'bg-lime text-teal-950 hover:bg-lime-600',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-[8px] px-3 text-xs',
        lg: 'h-14 rounded-[8px] px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * Work in flight: the button shows the app's spinner beside its label and
   * cannot be pressed again. Prefer this over swapping the label for
   * "Saving…" — every loading button in the app reads the same way.
   */
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        // After the spread, so a request in flight wins over the caller's own
        // `disabled`. `asChild` hands rendering to the caller's element, which
        // may be a link with no disabled state to set.
        {...(asChild ? {} : { disabled: isLoading || props.disabled })}
      >
        {/* asChild leaves the child's markup alone — there is nothing of ours
            to put a spinner beside */}
        {isLoading && !asChild ? (
          <span role="status" aria-label="Loading..." className="flex items-center gap-2">
            {/* currentColor so the spinner reads on every variant, gradient
                included, without each caller setting a colour */}
            <IconComponent
              iconName="Loading03Icon"
              size={16}
              color="currentColor"
              className="animate-spin"
            />
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
