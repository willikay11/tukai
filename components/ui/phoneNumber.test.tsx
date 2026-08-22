import React, { createRef } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Input } from './input';
import { PhoneNumber } from './phoneNumber';

const fieldBox = () => screen.getByRole('textbox').parentElement;

describe('PhoneNumber', () => {
  // The whole point of routing this through the shared Input: a phone field
  // should be indistinguishable from any other field in the same form
  describe('matches the shared field styling', () => {
    it('draws the standard border, radius and padding', () => {
      render(<PhoneNumber />);

      expect(fieldBox()).toHaveClass(
        'border',
        'border-gray-200',
        'rounded-[14px]',
        'px-4',
        'py-[13px]',
      );
    });

    it('focuses to brand green on a transparent ground', () => {
      render(<PhoneNumber />);

      expect(fieldBox()).toHaveClass('focus-within:border-brand-green', 'bg-transparent');
    });

    it('sets the number in 14px medium gray-800', () => {
      render(<PhoneNumber />);

      const field = screen.getByRole('textbox');
      expect(field).toHaveClass('text-[14px]', 'font-medium', 'text-gray-800');
      // The line box has to survive the merge alongside the size, or the field
      // stops matching the 44px of the inputs beside it
      expect(field).toHaveClass('leading-[18px]');
      expect(field).not.toHaveClass('text-[14.5px]');
    });

    it('is not a pill — only search fields are', () => {
      render(<PhoneNumber />);

      expect(fieldBox()).not.toHaveClass('rounded-full');
    });

    // The country-code trigger is a Select, which ships with its own h-[50px]
    // and a 20px chevron. Unconstrained they drive the field's height and it
    // stands taller than the inputs beside it.
    it('lets the field set its own height rather than the code picker', () => {
      render(<PhoneNumber />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('h-auto', 'leading-[18px]');
      expect(trigger).not.toHaveClass('h-[50px]');
    });

    it('boxes the field at the same height as a plain input', () => {
      const { unmount } = render(<PhoneNumber />);
      const phoneBox = fieldBox()?.className;
      unmount();

      render(<Input />);
      expect(phoneBox).toBe(fieldBox()?.className);
    });
  });

  describe('behaviour', () => {
    it('defaults the dialling code to +254', () => {
      render(<PhoneNumber />);

      expect(screen.getByText('+254')).toBeInTheDocument();
    });

    it('reports the code and number as one value', () => {
      const onChange = jest.fn();
      render(<PhoneNumber onChange={onChange} />);

      fireEvent.change(screen.getByRole('textbox'), { target: { value: '712345678' } });

      expect(onChange).toHaveBeenLastCalledWith('+254712345678');
    });

    it('forwards its ref to the number input', () => {
      const ref = createRef<HTMLInputElement>();
      render(<PhoneNumber ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('passes the placeholder through', () => {
      render(<PhoneNumber placeholder="Enter M-Pesa number" />);

      expect(screen.getByPlaceholderText('Enter M-Pesa number')).toBeInTheDocument();
    });
  });
});
