import { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { IntlPhoneField } from './IntlPhoneField';

jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));

// Radix popovers need these in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
});

const Harness = ({ onCountry }: { onCountry?: (iso: string) => void }) => {
  const [country, setCountry] = useState('KE');
  const [value, setValue] = useState('');
  return (
    <IntlPhoneField
      country={country}
      onCountryChange={(iso) => {
        setCountry(iso);
        onCountry?.(iso);
      }}
      value={value}
      onChange={setValue}
    />
  );
};

describe('IntlPhoneField (DEV-508)', () => {
  it('starts on the given country', () => {
    render(<Harness />);

    expect(screen.getByRole('button', { name: 'Country code, Kenya +254' })).toBeInTheDocument();
  });

  it('finds a country by name or code and switches to it', () => {
    const onCountry = jest.fn();
    render(<Harness onCountry={onCountry} />);

    fireEvent.click(screen.getByRole('button', { name: /Country code/ }));
    fireEvent.change(screen.getByLabelText('Search countries'), { target: { value: 'united k' } });
    fireEvent.click(screen.getByRole('option', { name: /United Kingdom/ }));

    expect(onCountry).toHaveBeenCalledWith('GB');
    expect(
      screen.getByRole('button', { name: 'Country code, United Kingdom +44' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Country code/ }));
    fireEvent.change(screen.getByLabelText('Search countries'), { target: { value: '+256' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: /Uganda/ })).toBeInTheDocument();
  });

  it('says so when no country matches', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /Country code/ }));
    fireEvent.change(screen.getByLabelText('Search countries'), { target: { value: 'zzz' } });

    expect(screen.getByText('No country matches that.')).toBeInTheDocument();
  });

  it('takes digits, spaces and dashes only', () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '07a700-900 123' },
    });

    expect(screen.getByLabelText('Phone number')).toHaveValue('07700-900 123');
  });
});
