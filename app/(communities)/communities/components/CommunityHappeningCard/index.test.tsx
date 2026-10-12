import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { CommunityHappeningCard } from './index';

// Null by default, so a case without one sees the link alone
const mockDrawer = { current: null as null | { openExperience: jest.Mock } };
jest.mock('@/context/ExperienceDrawerContext', () => ({
  useExperienceDrawer: () => mockDrawer.current,
}));

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <button type="button">bookmark</button>,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('next/link', () => {
  function MockLink({ children, href, ...rest }: Record<string, unknown>) {
    return (
      <a href={href as string} {...rest}>
        {children as React.ReactNode}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const experience = {
  id: 'e1',
  title: 'Pottery for beginners',
  photos: [{ id: 'ph1', photo: 'https://cdn.tukai.co/cover.jpg', isCover: true }],
  startDate: '2026-10-03T10:00:00Z',
  endDate: '2026-10-03T12:00:00Z',
  isBookmarked: false,
  priceStartsFrom: { amount: 1800, currency: 'KES' },
  hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' },
} as unknown as Experience;

describe('CommunityHappeningCard', () => {
  afterEach(() => {
    mockDrawer.current = null;
  });

  it('keeps the title link to the experience page', () => {
    render(<CommunityHappeningCard experience={experience} />);

    expect(screen.getByRole('link', { name: /Pottery for beginners/ })).toHaveAttribute(
      'href',
      '/experiences/e1',
    );
  });

  describe('opening the drawer', () => {
    const openExperience = jest.fn();

    beforeEach(() => {
      openExperience.mockClear();
      mockDrawer.current = { openExperience };
    });

    it('opens the drawer on a plain click of the title link', () => {
      render(<CommunityHappeningCard experience={experience} />);

      const notCancelled = fireEvent.click(screen.getByRole('link', { name: /Pottery/ }));

      expect(openExperience).toHaveBeenCalledWith('e1');
      // preventDefault was called, so the browser does not follow the link
      expect(notCancelled).toBe(false);
    });

    it('leaves a modified click to the browser, so it can open a new tab', () => {
      render(<CommunityHappeningCard experience={experience} />);

      const notCancelled = fireEvent.click(screen.getByRole('link', { name: /Pottery/ }), {
        metaKey: true,
      });

      expect(openExperience).not.toHaveBeenCalled();
      expect(notCancelled).toBe(true);
    });
  });

  it('keeps the link alone where there is no drawer', () => {
    render(<CommunityHappeningCard experience={experience} />);

    const notCancelled = fireEvent.click(screen.getByRole('link', { name: /Pottery/ }));

    expect(notCancelled).toBe(true);
  });
});
