import React from 'react';

import { render, screen } from '@testing-library/react';

import { Button } from './button';

/**
 * The canvas defines three button faces in its own `btn()`:
 *   primary → linear-gradient(180deg,#0C7A50,#044B36) on white text
 *   joined  → #E8F1ED behind #044B36, hairline #CBDDD4
 *   default → white behind #013334, hairline #DDE3DF
 *
 * These pin each to its variant. Two of them were previously on greens picked
 * before the canvas was readable, so the test is what stops them drifting back.
 */
describe('Button variants against the canvas', () => {
  it('draws the primary gradient from the canvas greens', () => {
    render(<Button variant="gradient">Go</Button>);

    const button = screen.getByRole('button');
    expect(button.className).toContain('from-brand-mid');
    expect(button.className).toContain('to-brand-deep');
  });

  it('puts the canvas ink on lime, and presses to the canvas lime', () => {
    render(<Button variant="lime">Save</Button>);

    const button = screen.getByRole('button');
    expect(button.className).toContain('text-brand-ink');
    expect(button.className).toContain('hover:bg-lime-dark');
  });

  it('offers the canvas resting button', () => {
    render(<Button variant="canvas-outline">Cancel</Button>);

    const button = screen.getByRole('button');
    expect(button.className).toContain('border-line');
    expect(button.className).toContain('text-brand-ink');
  });

  it('offers the canvas joined state', () => {
    render(<Button variant="joined">Joined</Button>);

    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-surface-brand');
    expect(button.className).toContain('text-brand-deep');
    expect(button.className).toContain('border-line-brand');
  });

  // The greens these two carried before the canvas was readable
  it.each([
    ['gradient', '#047857'],
    ['gradient', '#064E3B'],
  ])('%s no longer carries the guessed %s', (variant, hex) => {
    render(<Button variant={variant as 'gradient'}>Go</Button>);

    expect(screen.getByRole('button').className).not.toContain(hex);
  });
});
