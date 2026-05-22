import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ExperienceTypePicker } from './ExperienceTypePicker';

jest.mock('@/components/ui/pillRadioGroup', () => ({
  PillRadioGroup: ({ options, value, onChange }: any) => (
    <div>
      {options.map((opt: any) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          data-testid={`pill-${opt.value}`}
          className={value === opt.value ? 'selected' : ''}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

describe('ExperienceTypePicker', () => {
  it('renders both paid and free options', () => {
    const mockOnChange = jest.fn();
    render(<ExperienceTypePicker value="paid" onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: 'Paid Experience' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Free Experience' })).toBeInTheDocument();
  });

  it('shows paid as selected when value is paid', () => {
    const mockOnChange = jest.fn();
    const { container } = render(<ExperienceTypePicker value="paid" onChange={mockOnChange} />);

    const paidButton = screen.getByTestId('pill-paid');
    expect(paidButton).toHaveClass('selected');
  });

  it('shows free as selected when value is free', () => {
    const mockOnChange = jest.fn();
    const { container } = render(<ExperienceTypePicker value="free" onChange={mockOnChange} />);

    const freeButton = screen.getByTestId('pill-free');
    expect(freeButton).toHaveClass('selected');
  });

  it('calls onChange with paid when paid button is clicked', () => {
    const mockOnChange = jest.fn();
    render(<ExperienceTypePicker value="free" onChange={mockOnChange} />);

    const paidButton = screen.getByRole('button', { name: 'Paid Experience' });
    fireEvent.click(paidButton);

    expect(mockOnChange).toHaveBeenCalledWith('paid');
  });

  it('calls onChange with free when free button is clicked', () => {
    const mockOnChange = jest.fn();
    render(<ExperienceTypePicker value="paid" onChange={mockOnChange} />);

    const freeButton = screen.getByRole('button', { name: 'Free Experience' });
    fireEvent.click(freeButton);

    expect(mockOnChange).toHaveBeenCalledWith('free');
  });

  it('renders the label', () => {
    const mockOnChange = jest.fn();
    render(<ExperienceTypePicker value="paid" onChange={mockOnChange} />);

    expect(screen.getByText('Is this a free or a paid Experience?')).toBeInTheDocument();
  });
});
