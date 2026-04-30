import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExperienceTypePicker } from './ExperienceTypePicker';

describe('ExperienceTypePicker', () => {
  it('renders both paid and free buttons', () => {
    const mockOnChange = jest.fn();
    render(<ExperienceTypePicker value="paid" onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: 'Paid Experience' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Free Experience' })).toBeInTheDocument();
  });

  it('shows paid as selected when value is paid', () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <ExperienceTypePicker value="paid" onChange={mockOnChange} />
    );

    const paidButton = screen.getByRole('button', { name: 'Paid Experience' });
    expect(paidButton).toHaveClass('bg-emerald-600');
  });

  it('shows free as selected when value is free', () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <ExperienceTypePicker value="free" onChange={mockOnChange} />
    );

    const freeButton = screen.getByRole('button', { name: 'Free Experience' });
    expect(freeButton).toHaveClass('bg-emerald-600');
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
