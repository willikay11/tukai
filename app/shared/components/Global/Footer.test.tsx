import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';

import { Footer } from './Footer';

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

    expect(screen.getByRole('heading', { name: 'Location' })).toBeInTheDocument();
    expect(screen.getAllByText('Nairobi').length).toBeGreaterThan(0);
  });

  it('shows no location when the reader has not selected one', () => {
    render(<Footer />);

    expect(screen.queryByRole('heading', { name: 'Location' })).not.toBeInTheDocument();
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
    expect(screen.getByText('Terms of use')).toBeInTheDocument();
    expect(screen.getByText('Privacy policy')).toBeInTheDocument();
  });

  it('links the four destinations other than Discover', () => {
    render(<Footer />);

    const nav = screen.getByRole('navigation', { name: 'Footer' });
    const link = (name: string) => within(nav).getByRole('link', { name });

    expect(within(nav).queryByRole('link', { name: 'Discover' })).not.toBeInTheDocument();
    expect(link('Bucket lists')).toHaveAttribute('href', '/bucket-lists');
    expect(link('Communities')).toHaveAttribute('href', '/communities');
    expect(link('Plans')).toHaveAttribute('href', '/plans');
    expect(link('You')).toHaveAttribute('href', '/profile');
  });

  it('links Help beneath You', () => {
    render(<Footer />);

    const nav = screen.getByRole('navigation', { name: 'Footer' });
    const you = within(nav).getByRole('link', { name: 'You' }).closest('li');

    expect(within(you as HTMLElement).getByRole('link', { name: 'Help' })).toHaveAttribute(
      'href',
      '/help',
    );
  });
});
