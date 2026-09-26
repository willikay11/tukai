import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceOrganiser } from './experienceOrganiser';

let sessionState: { data: { user: { id: string } } | null } = { data: { user: { id: 'viewer' } } };
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

jest.mock('@/app/shared/components/SendMessage/SendMessage', () => ({
  SendMessage: () => <div data-testid="send-message" />,
}));

const experience = (hostId: string) =>
  ({
    id: 'exp-1',
    host: {
      id: hostId,
      displayName: 'Tony Ouma',
      picture: 'https://cdn.test/a.jpg',
      experienceHostedCount: 4,
    },
  }) as unknown as Experience;

describe('ExperienceOrganiser', () => {
  beforeEach(() => {
    sessionState = { data: { user: { id: 'viewer' } } };
  });

  it('names the host and how much they have run', () => {
    render(<ExperienceOrganiser experience={experience('host-1')} />);

    expect(screen.getByText('Tony Ouma')).toBeInTheDocument();
    expect(screen.getByText('4 Experiences organised')).toBeInTheDocument();
  });

  it('offers to message a host who is somebody else', () => {
    render(<ExperienceOrganiser experience={experience('host-1')} />);

    expect(screen.getByRole('button', { name: /Message host/ })).toBeInTheDocument();
    expect(screen.getByTestId('send-message')).toBeInTheDocument();
  });

  // Nobody needs to message themselves
  it('does not offer to message yourself on your own experience', () => {
    render(<ExperienceOrganiser experience={experience('viewer')} />);

    expect(screen.queryByRole('button', { name: /Message host/ })).not.toBeInTheDocument();
    expect(screen.queryByTestId('send-message')).not.toBeInTheDocument();
    // The host block itself still reads as normal
    expect(screen.getByText('Tony Ouma')).toBeInTheDocument();
  });

  it('still offers it to a reader who is not signed in', () => {
    sessionState = { data: null };

    render(<ExperienceOrganiser experience={experience('host-1')} />);

    expect(screen.getByRole('button', { name: /Message host/ })).toBeInTheDocument();
  });

  /**
   * On a phone the host name and the button shared one narrow row, so a long
   * name wrapped to two lines and the button — sized `h-full` — stretched down
   * the side of it.
   */
  describe('the layout on a narrow screen', () => {
    const longName = (host: string) => ({
      ...experience(host),
      host: { ...experience(host).host, displayName: 'Timeless Groove Productions' },
    });

    it('stacks the button under the host below sm', () => {
      const { container } = render(
        <ExperienceOrganiser experience={longName('host-1') as never} />,
      );

      const card = container.querySelector('.rounded-\\[15px\\]');
      expect(card?.className).toContain('flex-col');
      expect(card?.className).toContain('sm:flex-row');
    });

    it('truncates a long host name rather than wrapping it', () => {
      render(<ExperienceOrganiser experience={longName('host-1') as never} />);

      expect(screen.getByText('Timeless Groove Productions')).toHaveClass('truncate');
    });

    it('gives the button its own height, not the row’s', () => {
      render(<ExperienceOrganiser experience={longName('host-1') as never} />);

      const button = screen.getByRole('button', { name: /Message host/ });
      expect(button.className).toContain('h-10');
      expect(button.className).not.toContain('h-full');
    });
  });

  // "1 Experiences organised" read as a typo on every host with one
  describe('the experiences-organised count', () => {
    const withCount = (count: number) => {
      const base = experience('host-1');
      return { ...base, host: { ...base.host, experienceHostedCount: count } } as never;
    };

    it('says Experience for one', () => {
      render(<ExperienceOrganiser experience={withCount(1)} />);

      expect(screen.getByText('1 Experience organised')).toBeInTheDocument();
    });

    it.each([0, 4])('says Experiences for %i', (count) => {
      render(<ExperienceOrganiser experience={withCount(count)} />);

      expect(screen.getByText(`${count} Experiences organised`)).toBeInTheDocument();
    });
  });
});
