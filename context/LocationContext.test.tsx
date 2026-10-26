import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LocationProvider, useLocation } from './LocationContext';

const getCurrentPosition = jest.fn();

const Probe = () => {
  const {
    status,
    isUsingLocation,
    area,
    city,
    away,
    homeCity,
    locationToast,
    setUsingLocation,
    setCity,
    goHome,
  } = useLocation();

  return (
    <div>
      <p data-testid="state">{`${status}|${isUsingLocation}`}</p>
      <p data-testid="where">{area ?? city ?? '-'}</p>
      <p data-testid="away">{`${away}`}</p>
      <p data-testid="toast">{locationToast ?? '-'}</p>
      <button onClick={() => setUsingLocation(true)}>on</button>
      <button onClick={() => setUsingLocation(false)}>off</button>
      <button onClick={() => setCity('Mombasa')}>pick Mombasa</button>
      <button onClick={goHome}>home</button>
      <p data-testid="home-city">{homeCity}</p>
    </div>
  );
};

const renderProbe = () =>
  render(
    <LocationProvider>
      <Probe />
    </LocationProvider>,
  );

const grant = () =>
  getCurrentPosition.mockImplementation((onSuccess: PositionCallback) =>
    onSuccess({ coords: { latitude: -1.26, longitude: 36.8 } } as GeolocationPosition),
  );

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      results: [
        {
          address_components: [
            { types: ['sublocality'], long_name: 'Westlands' },
            { types: ['locality'], long_name: 'Nairobi' },
          ],
        },
      ],
    }),
  }) as unknown as typeof fetch;
});

describe('using my location', () => {
  it('starts off', () => {
    renderProbe();

    expect(screen.getByTestId('state')).toHaveTextContent('idle|false');
  });

  it('asks for permission when it is turned on', async () => {
    grant();
    renderProbe();

    await userEvent.click(screen.getByText('on'));

    expect(getCurrentPosition).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('granted|true'));
  });

  /**
   * The bug this exists to stop: a page cannot un-grant a permission, so a
   * switch bound to `status` could be turned on and never off.
   */
  it('turns back off while the permission stays granted', async () => {
    grant();
    renderProbe();

    await userEvent.click(screen.getByText('on'));
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('granted|true'));

    await userEvent.click(screen.getByText('off'));

    expect(screen.getByTestId('state')).toHaveTextContent('granted|false');
  });

  it('does not ask twice once permission is held', async () => {
    grant();
    renderProbe();

    await userEvent.click(screen.getByText('on'));
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('granted|true'));

    await userEvent.click(screen.getByText('off'));
    await userEvent.click(screen.getByText('on'));

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('remembers the preference across a reload', async () => {
    grant();
    const first = renderProbe();

    await userEvent.click(screen.getByText('on'));
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('granted|true'));
    first.unmount();

    renderProbe();

    expect(screen.getByTestId('state')).toHaveTextContent('granted|true');
  });

  it('says a refusal is a refusal', async () => {
    getCurrentPosition.mockImplementation((_ok: unknown, onError: PositionErrorCallback) =>
      onError({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError),
    );
    renderProbe();

    await userEvent.click(screen.getByText('on'));

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('denied|true'));
  });

  // The neighbourhood is what makes it read as where you are, rather than as a
  // city you already knew you were in
  it('resolves the neighbourhood as well as the city', async () => {
    grant();
    renderProbe();

    await userEvent.click(screen.getByText('on'));

    await waitFor(() =>
      expect(screen.getByTestId('where')).toHaveTextContent('Westlands, Nairobi'),
    );
  });

  it('puts up a toast once the city resolves', async () => {
    grant();
    renderProbe();

    await userEvent.click(screen.getByText('on'));

    await waitFor(() =>
      expect(screen.getByTestId('toast')).toHaveTextContent(
        'Location on. Closest first, around Westlands, Nairobi.',
      ),
    );
  });
});

describe('home and away', () => {
  it('starts at home', () => {
    renderProbe();

    expect(screen.getByTestId('away')).toHaveTextContent('false');
  });

  it('is away once another city is picked', async () => {
    renderProbe();

    await userEvent.click(screen.getByText('pick Mombasa'));

    expect(screen.getByTestId('away')).toHaveTextContent('true');
  });

  it('never counts as away while location is on', async () => {
    grant();
    renderProbe();

    await userEvent.click(screen.getByText('pick Mombasa'));
    expect(screen.getByTestId('away')).toHaveTextContent('true');

    await userEvent.click(screen.getByText('on'));
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('granted|true'));

    expect(screen.getByTestId('away')).toHaveTextContent('false');
  });

  it('goes home, off location, with a toast', async () => {
    renderProbe();

    await userEvent.click(screen.getByText('pick Mombasa'));
    expect(screen.getByTestId('away')).toHaveTextContent('true');

    await userEvent.click(screen.getByText('home'));

    expect(screen.getByTestId('away')).toHaveTextContent('false');
    expect(screen.getByTestId('where')).toHaveTextContent(
      screen.getByTestId('home-city').textContent ?? '',
    );
    expect(screen.getByTestId('toast')).toHaveTextContent('Back to Nairobi.');
  });
});
