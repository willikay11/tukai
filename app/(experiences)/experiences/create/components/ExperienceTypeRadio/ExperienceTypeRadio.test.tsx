import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ExperienceTypeRadio } from '.';

// The three types are toggle pills now, not radio inputs, and "recurring" is a
// Switch rather than a checkbox.
const renderPicker = (props: Partial<React.ComponentProps<typeof ExperienceTypeRadio>> = {}) => {
  const onChange = jest.fn();
  const onRecurringChange = jest.fn();

  render(
    <ExperienceTypeRadio
      value="one-time"
      onChange={onChange}
      isRecurring={false}
      onRecurringChange={onRecurringChange}
      {...props}
    />,
  );

  return { onChange, onRecurringChange };
};

const pill = (name: string) => screen.getByRole('button', { name });

describe('ExperienceTypeRadio', () => {
  it('renders the section label', () => {
    renderPicker();

    expect(screen.getByText('Experience Type')).toBeInTheDocument();
  });

  it('offers all three experience types', () => {
    renderPicker();

    expect(pill('One-Time/Day Experience')).toBeInTheDocument();
    expect(pill('Multi-Day Experience (e.g., 2 days straight)')).toBeInTheDocument();
    expect(pill('Itinerary')).toBeInTheDocument();
  });

  it('fills only the selected type', () => {
    renderPicker({ value: 'itinerary' });

    expect(pill('Itinerary')).toHaveClass('text-white');
    expect(pill('One-Time/Day Experience')).not.toHaveClass('text-white');
  });

  it('reports the type when a pill is picked', () => {
    const { onChange } = renderPicker();

    fireEvent.click(pill('Multi-Day Experience (e.g., 2 days straight)'));

    expect(onChange).toHaveBeenCalledWith('multi-day');
  });

  describe('recurring switch', () => {
    it('offers recurring for a one-time experience', () => {
      renderPicker({ value: 'one-time' });

      expect(screen.getByText('Make this a recurring experience')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    // Only a single-day experience can repeat — a multi-day span or an
    // itinerary has its own dates
    it('hides recurring for the other types', () => {
      renderPicker({ value: 'multi-day' });

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('shows as on when the experience recurs', () => {
      renderPicker({ isRecurring: true });

      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('shows as off when it does not', () => {
      renderPicker({ isRecurring: false });

      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('reports a change', () => {
      const { onRecurringChange } = renderPicker({ isRecurring: false });

      fireEvent.click(screen.getByRole('switch'));

      expect(onRecurringChange).toHaveBeenCalledWith(true);
    });
  });
});
