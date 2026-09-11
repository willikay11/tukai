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
});
