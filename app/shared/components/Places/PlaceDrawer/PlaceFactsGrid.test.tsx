import React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { PlaceProperty } from '@/types/place';

import { PlaceFactsGrid } from './PlaceFactsGrid';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const makeProperty = (overrides: Partial<PlaceProperty>): PlaceProperty => ({
  id: 'x',
  key: 'Key',
  value: 'Value',
  ...overrides,
});

describe('PlaceFactsGrid', () => {
  const writeText = jest.fn();

  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when no property has a value', () => {
    const { container } = render(
      <PlaceFactsGrid properties={[makeProperty({ id: 'a', value: '' })]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders each label and value', () => {
    render(
      <PlaceFactsGrid
        properties={[
          makeProperty({ id: 'a', key: 'Hours', value: 'Mon to Fri' }),
          makeProperty({ id: 'b', key: 'Type', value: 'Workshop' }),
        ]}
      />,
    );

    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Mon to Fri')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Workshop')).toBeInTheDocument();
  });

  it('renders a website value as an external link with a scheme', () => {
    render(
      <PlaceFactsGrid
        properties={[
          makeProperty({ id: 'w', key: 'Website', value: 'kazuri.co.ke', linkType: 'website' }),
        ]}
      />,
    );

    const link = screen.getByRole('link', { name: 'kazuri.co.ke' });
    expect(link).toHaveAttribute('href', 'https://kazuri.co.ke');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('keeps a website value that already has a scheme as it is', () => {
    render(
      <PlaceFactsGrid
        properties={[makeProperty({ id: 'w', value: 'http://kazuri.co.ke', linkType: 'website' })]}
      />,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', 'http://kazuri.co.ke');
  });

  it('renders an email value as a mailto link without opening a new tab', () => {
    render(
      <PlaceFactsGrid
        properties={[
          makeProperty({ id: 'e', key: 'Email', value: 'hello@kazuri.co.ke', linkType: 'email' }),
        ]}
      />,
    );

    const link = screen.getByRole('link', { name: 'hello@kazuri.co.ke' });
    expect(link).toHaveAttribute('href', 'mailto:hello@kazuri.co.ke');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders a value with no link type as plain text', () => {
    render(<PlaceFactsGrid properties={[makeProperty({ id: 'p', value: 'Parkwood Villas' })]} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Parkwood Villas')).toBeInTheDocument();
  });

  it('gives the copy button a 44px hit area and copies the value', async () => {
    render(
      <PlaceFactsGrid
        properties={[
          makeProperty({ id: 'ph', key: 'Phone', value: '+254 700 000 000', canCopy: true }),
        ]}
      />,
    );

    const button = screen.getByRole('button', { name: 'Copy Phone' });
    expect(button).toHaveClass('h-11', 'w-11');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledWith('+254 700 000 000');
    expect(await screen.findByRole('button', { name: 'Phone copied' })).toBeInTheDocument();
  });

  it('does not render a copy button for rows that cannot be copied', () => {
    render(<PlaceFactsGrid properties={[makeProperty({ id: 'p', value: 'Nairobi' })]} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
