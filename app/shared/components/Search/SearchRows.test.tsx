import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RecentSearchPill } from './RecentSearchPill';
import { SearchSectionHeading } from './SearchSectionHeading';
import { SuggestionRow } from './SuggestionRow';

describe('SuggestionRow', () => {
  it('renders name and subtitle and fires onSelect', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<SuggestionRow name="Nairobi" subtitle="City in Kenya" onSelect={onSelect} />);

    expect(screen.getByText('Nairobi')).toBeInTheDocument();
    expect(screen.getByText('City in Kenya')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('RecentSearchPill', () => {
  it('renders the term with a clock and fires onSelect', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<RecentSearchPill term="Nyama choma" onSelect={onSelect} />);

    expect(screen.getByText('Nyama choma')).toBeInTheDocument();
    expect(screen.getByTestId('Clock01Icon')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('is a pill, not a boxed field', () => {
    render(<RecentSearchPill term="Hiking" onSelect={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('rounded-full', 'bg-gray-100');
  });
});

describe('SearchSectionHeading', () => {
  // Small caps label, matching the design's section dividers
  it('renders its label in uppercase styling', () => {
    render(<SearchSectionHeading>Recent searches</SearchSectionHeading>);

    const heading = screen.getByText('Recent searches');
    expect(heading).toHaveClass('uppercase', 'tracking-wider', 'text-gray-400');
  });
});
