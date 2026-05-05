import { render, screen } from '@testing-library/react';
import { RecurrencePreviewLabel } from './RecurrencePreviewLabel';

describe('RecurrencePreviewLabel', () => {
  it('renders nothing when startDate is null', () => {
    const { container } = render(
      <RecurrencePreviewLabel selectedDays={['mon']} startDate={null} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when no days are selected', () => {
    const { container } = render(
      <RecurrencePreviewLabel selectedDays={[]} startDate="2026-05-05" />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('computes first occurrence when both startDate and days are provided', () => {
    render(<RecurrencePreviewLabel selectedDays={['mon', 'fri']} startDate="2026-05-05" />);

    expect(screen.getByText(/Your first experience will be on/)).toBeInTheDocument();
  });

  it('formats date correctly with weekday, day number, and month name', () => {
    render(<RecurrencePreviewLabel selectedDays={['tue']} startDate="2026-05-05" />);

    const text = screen.getByText(/Your first experience will be on/);
    expect(text.textContent).toMatch(/Tuesday, \d+ \w+/);
  });

  it('renders with green background styling', () => {
    const { container } = render(
      <RecurrencePreviewLabel selectedDays={['mon']} startDate="2026-05-05" />,
    );

    const pill = container.querySelector('div');
    expect(pill).toHaveClass('bg-emerald-700', 'text-white');
  });
});
