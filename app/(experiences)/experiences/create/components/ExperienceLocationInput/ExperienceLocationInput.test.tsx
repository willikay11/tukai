import { render, screen } from '@testing-library/react';

import { ExperienceLocationInput } from './ExperienceLocationInput';

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useGoogleMapsAutocomplete: jest.fn(() => ({
    data: { data: [] },
    isFetching: false,
  })),
}));

jest.mock('@/app/shared/components/LocationPicker', () => ({
  LocationAutocompleteField: ({ value, placeholder }: any) => (
    <input placeholder={placeholder} value={value} />
  ),
}));

describe('ExperienceLocationInput', () => {
  it('renders location input field', () => {
    render(<ExperienceLocationInput value="" onChange={() => {}} />);
    expect(screen.getByText('Where will the experience take place?')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<ExperienceLocationInput value="Nairobi" onChange={() => {}} />);
    const input = screen.getByDisplayValue('Nairobi');
    expect(input).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(<ExperienceLocationInput value="" onChange={() => {}} error="Location is required" />);
    expect(screen.getByText('Location is required')).toBeInTheDocument();
  });
});
