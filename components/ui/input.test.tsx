import React, { createRef } from 'react';

import { render, screen } from '@testing-library/react';

import { Input } from './input';

const boxOf = () => screen.getByRole('textbox').parentElement;

describe('Input', () => {
  describe('field styling', () => {
    it('draws a 1px grey border at a 14px radius', () => {
      render(<Input />);

      expect(boxOf()).toHaveClass('border', 'border-gray-200', 'rounded-[14px]');
    });

    it('pads 13px vertically and 16px horizontally', () => {
      render(<Input />);

      expect(boxOf()).toHaveClass('py-[13px]', 'px-4');
    });

    // So the same field reads correctly on a white card and on a grey panel
    it('keeps the background transparent', () => {
      render(<Input />);

      expect(boxOf()).toHaveClass('bg-transparent');
      expect(screen.getByRole('textbox')).toHaveClass('bg-transparent');
    });

    it('turns the border brand green on focus', () => {
      render(<Input />);

      expect(boxOf()).toHaveClass('focus-within:border-brand-green');
    });
  });

  describe('text styling', () => {
    it('sets 14.5px semibold in gray-800', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toHaveClass(
        'text-[14.5px]',
        'font-medium',
        'text-gray-800',
      );
    });

    // A placeholder at the value's weight reads as a filled-in field
    it('lightens the placeholder without shrinking it', () => {
      render(<Input placeholder="Email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('placeholder:font-normal', 'placeholder:text-gray-400');
      expect(input.className).not.toMatch(/placeholder:text-(xs|sm)/);
    });
  });

  describe('shape', () => {
    it('is a 14px rounded box by default', () => {
      render(<Input />);

      expect(boxOf()).toHaveClass('rounded-[14px]');
      expect(boxOf()).not.toHaveClass('rounded-full');
    });

    it('becomes a pill for search fields', () => {
      render(<Input shape="pill" />);

      expect(boxOf()).toHaveClass('rounded-full');
      expect(boxOf()).not.toHaveClass('rounded-[14px]');
    });
  });

  describe('slots', () => {
    it('renders a leading icon', () => {
      render(<Input icon={<span data-testid="lead">@</span>} />);

      expect(screen.getByTestId('lead')).toBeInTheDocument();
    });

    it('renders a trailing icon', () => {
      render(<Input suffixIcon={<span data-testid="trail">x</span>} />);

      expect(screen.getByTestId('trail')).toBeInTheDocument();
    });

    // className reaches the input; containerClassName reaches the box
    it('routes overrides to the right element', () => {
      render(<Input className="text-right" containerClassName="bg-gray-100" />);

      expect(screen.getByRole('textbox')).toHaveClass('text-right');
      expect(boxOf()).toHaveClass('bg-gray-100');
    });
  });

  describe('behaviour', () => {
    it('forwards its ref to the input element', () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('passes through native props', () => {
      render(<Input placeholder="Email" name="email" defaultValue="a@b.co" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
      expect(input).toHaveValue('a@b.co');
    });

    it('dims the whole field when disabled', () => {
      render(<Input disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(boxOf()).toHaveClass('cursor-not-allowed', 'opacity-50');
    });
  });
});
