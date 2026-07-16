import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchResult } from '@/types/search';

import { ResultRow } from './ResultRow';
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

describe('ResultRow', () => {
  const result = {
    id: 'experience-exp-1',
    type: 'experience',
    data: {
      id: 'exp-1',
      title: 'Karura Forest Hike',
      location: { formattedAddress: 'Karura, Nairobi' },
      photos: [],
    },
  } as unknown as SearchResult;

  it('renders title, meta and the correct type pill', () => {
    render(<ResultRow result={result} onSelect={jest.fn()} />);

    expect(screen.getByText('Karura Forest Hike')).toBeInTheDocument();
    expect(screen.getByText('Karura, Nairobi')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it.each([
    ['place', 'Place'],
    ['community', 'Community'],
  ] as const)('labels %s results with the %s pill', (type, label) => {
    render(<ResultRow result={{ ...result, type } as SearchResult} onSelect={jest.fn()} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('fires onSelect on click', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<ResultRow result={result} onSelect={onSelect} />);
    await user.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalled();
  });
});
