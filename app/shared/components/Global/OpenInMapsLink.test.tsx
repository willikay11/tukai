import React from 'react';

import { render, screen } from '@testing-library/react';

import { OpenInMapsLink } from './OpenInMapsLink';

describe('OpenInMapsLink', () => {
  // Google's api=1 URL hands off to the Maps app on a phone and the web
  // elsewhere, so one href covers both without sniffing the platform
  it('turns the location line it is given into the link', () => {
    render(
      <OpenInMapsLink lat={-1.2921} lng={36.8219}>
        Nairobi · 5 Kms away
      </OpenInMapsLink>,
    );

    expect(screen.getByRole('link', { name: /Nairobi/ })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=-1.2921%2C36.8219',
    );
  });

  it('falls back to searching by name when there are no coordinates', () => {
    render(<OpenInMapsLink query="Talisman, Nairobi">Nairobi</OpenInMapsLink>);

    expect(screen.getByRole('link', { name: /Nairobi/ })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=Talisman%2C%20Nairobi',
    );
  });

  it('opens in a new tab without handing over the referrer', () => {
    render(
      <OpenInMapsLink lat={1} lng={2}>
        Nairobi
      </OpenInMapsLink>,
    );

    const link = screen.getByRole('link', { name: /Nairobi/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // Nothing to point at is not a broken link, it is no link
  it('renders nothing without coordinates or a query', () => {
    const { container } = render(<OpenInMapsLink>Nairobi</OpenInMapsLink>);

    expect(container).toBeEmptyDOMElement();
  });
});
