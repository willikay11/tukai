import React from 'react';

import { fireEvent, render, screen, within } from '@testing-library/react';

import { DateField } from './DateField';

jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));

// Radix popovers need these in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
});

const dayCell = (iso: string) => {
  const cell = screen.getByRole('grid').querySelector(`[data-day="${iso}"]`);
  if (!cell) throw new Error(`No cell for ${iso}`);
  return cell as HTMLElement;
};

// DEV-503: days before minDate are greyed out, not hidden
describe('DateField, with a minimum date', () => {
  const minDate = new Date(2026, 10, 19);

  const open = (onChange = jest.fn()) => {
    render(<DateField label="Start date" value={null} onChange={onChange} minDate={minDate} />);
    fireEvent.click(screen.getByRole('button', { name: /Start date/ }));
    return onChange;
  };

  it('still shows the days before it, as disabled', () => {
    open();

    const cell = dayCell('2026-11-18');
    expect(cell).not.toHaveClass('opacity-0');
    const button = within(cell).getByRole('button', { name: /18/ });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('text-[#B4BEB9]');
  });

  it('will not pick a past day, but picks the minimum day itself', () => {
    const onChange = open();

    fireEvent.click(within(dayCell('2026-11-18')).getByRole('button'));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(within(dayCell('2026-11-19')).getByRole('button'));
    expect(onChange).toHaveBeenCalledWith('2026-11-19');
  });
});
