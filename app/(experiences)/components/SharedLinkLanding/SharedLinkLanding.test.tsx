import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';

import { SharedLinkLanding } from './index';

const replace = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

let openPlaceId: string | null = null;
const openPlace = jest.fn();
const openExperience = jest.fn();
const openCommunity = jest.fn();

jest.mock('@/context/PlaceDrawerContext', () => ({
  usePlaceDrawer: () => ({ openPlaceId, openPlace }),
}));
jest.mock('@/context/ExperienceDrawerContext', () => ({
  useExperienceDrawer: () => ({ openExperienceId: null, openExperience }),
}));
jest.mock('@/context/CommunityDrawerContext', () => ({
  useCommunityDrawer: () => ({ openCommunityId: null, openCommunity }),
}));

describe('SharedLinkLanding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    openPlaceId = null;
  });

  it.each([
    ['place', openPlace],
    ['experience', openExperience],
    ['community', openCommunity],
  ] as const)('opens the %s drawer for the shared id', (kind, open) => {
    render(<SharedLinkLanding kind={kind} id="abc123" />);

    expect(open).toHaveBeenCalledWith('abc123');
  });

  it('opens it once, not on every render', () => {
    const { rerender } = render(<SharedLinkLanding kind="place" id="abc123" />);
    rerender(<SharedLinkLanding kind="place" id="abc123" />);

    expect(openPlace).toHaveBeenCalledTimes(1);
  });

  it('stays put before the drawer has opened', () => {
    render(<SharedLinkLanding kind="place" id="abc123" />);

    expect(replace).not.toHaveBeenCalled();
  });

  it('leaves for Discover proper once the drawer is closed', () => {
    const { rerender } = render(<SharedLinkLanding kind="place" id="abc123" />);

    openPlaceId = 'abc123';
    act(() => rerender(<SharedLinkLanding kind="place" id="abc123" />));
    expect(replace).not.toHaveBeenCalled();

    openPlaceId = null;
    act(() => rerender(<SharedLinkLanding kind="place" id="abc123" />));
    expect(replace).toHaveBeenCalledWith('/', { scroll: false });
  });
});
