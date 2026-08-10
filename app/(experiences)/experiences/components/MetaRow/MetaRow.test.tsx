import { render, screen } from '@testing-library/react';

import { MetaRow } from './index';

describe('MetaRow', () => {
  it('renders nothing when given no parts', () => {
    const { container } = render(<MetaRow />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the experience day alongside the location', () => {
    render(<MetaRow location="Nairobi, Kenya" date="Saturday 15, August" />);

    expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
    expect(screen.getByText('Saturday 15, August')).toBeInTheDocument();
  });

  // The detail page shows when the experience runs, not how long it lasts
  it('prefers the date over a duration when both are supplied', () => {
    render(<MetaRow date="Saturday 15, August" durationMinutes={180} />);

    expect(screen.getByText('Saturday 15, August')).toBeInTheDocument();
    expect(screen.queryByText('3 hr')).not.toBeInTheDocument();
  });

  it('still formats a duration when no date is given', () => {
    render(<MetaRow durationMinutes={150} />);
    expect(screen.getByText('2 hr 30 min')).toBeInTheDocument();
  });
});
