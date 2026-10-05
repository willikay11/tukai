import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

// `transition` rather than `transition-colors`: the press feedback below needs
// transform to animate too, and tailwind-merge would keep only the last of the
// two anyway. Every button in the app dips slightly when pressed — a press that
// does nothing visible reads as a click that did not land.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-xs font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
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
        // The canvas's primary: linear-gradient(180deg,#0C7A50,#044B36). It was
        // on #047857 -> #064E3B, which is a different pair of greens.
        gradient: 'bg-gradient-to-b from-brand-mid to-brand-deep text-white',
        // The outlined counterpart of `gradient`: the same two greens, but as
        // the border on a white face. Two backgrounds do it — white clipped to
        // the padding box over the gradient clipped to the border box — which
        // is the only way a gradient border follows the corner radius.
        'gradient-outline':
          'border border-transparent text-brand [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(to_bottom,#0C7A50,#044B36)_border-box] hover:opacity-90',
        'outline-primary':
          'rounded-full border border-primary bg-white text-primary hover:bg-primary/5',
        // Canvas lime chip: #013334 on #B0E800, pressing to #A3D900. The hover
        // was Tailwind's lime-600 (#65A30D), a different colour entirely.
        lime: 'bg-lime text-brand-ink hover:bg-lime-dark',
        // The canvas's resting button: a white face, deep-teal label, hairline
        // border. Its default, where ours is a filled `default`.
        'canvas-outline': 'border border-line bg-white text-brand-ink hover:bg-surface',
        // The canvas's "already done" state — joined a community, saved a list
        joined: 'border border-line-brand bg-surface-brand text-brand-deep',
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
        {/* asChild leaves the child's markup alone - there is nothing of ours
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
