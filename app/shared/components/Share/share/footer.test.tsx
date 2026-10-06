import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Footer } from './footer';

let city: string | undefined;

jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ city }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { fill, quality, ...imgProps } = props;
    return <img {...imgProps} />;
  },
}));

describe('Footer', () => {
  beforeEach(() => {
    city = undefined;
  });

  it("names the reader's selected city", () => {
    city = 'Nairobi';

    render(<Footer />);

    expect(screen.getByText('Location:')).toBeInTheDocument();
    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });

  it('shows no location when the reader has not selected one', () => {
    render(<Footer />);

    expect(screen.queryByText('Location:')).not.toBeInTheDocument();
  });

  it('never names the old hardcoded address', () => {
    city = 'Nairobi';

    render(<Footer />);

    expect(screen.queryByText(/Parkwood Villas/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Syokimau/)).not.toBeInTheDocument();
  });

  it('keeps contacts and the legal line when there is no location', () => {
    render(<Footer />);

    expect(screen.getByText('support@tukai.co')).toBeInTheDocument();
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });
});
