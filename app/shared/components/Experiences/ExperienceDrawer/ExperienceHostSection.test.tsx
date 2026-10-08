import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceHostSection } from './ExperienceHostSection';

let sessionState: { data: { user: { id: string } } | null } = { data: { user: { id: 'viewer' } } };
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

jest.mock('@/app/shared/components/SendMessage/SendMessage', () => ({
  SendMessage: () => <div data-testid="send-message" />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const experience = (overrides: Partial<Experience>) =>
  ({
    id: 'exp-1',
    ...overrides,
  }) as unknown as Experience;

describe('ExperienceHostSection', () => {
  beforeEach(() => {
    sessionState = { data: { user: { id: 'viewer' } } };
  });

  it('names the host and how much they have run', () => {
    render(
      <ExperienceHostSection
        experience={experience({
          host: { id: 'host-1', displayName: 'Tony Ouma', experienceHostedCount: 4 } as never,
        })}
      />,
    );

    expect(screen.getByText('Tony Ouma')).toBeInTheDocument();
    expect(screen.getByText('4 Experiences organised')).toBeInTheDocument();
  });

  it('offers to message a host who is somebody else', () => {
    render(
      <ExperienceHostSection
        experience={experience({ host: { id: 'host-1', displayName: 'Tony Ouma' } as never })}
      />,
    );

    expect(screen.getByRole('button', { name: /Message host/ })).toBeInTheDocument();
  });

  it('does not offer to message yourself on your own experience', () => {
    render(
      <ExperienceHostSection
        experience={experience({ host: { id: 'viewer', displayName: 'Tony Ouma' } as never })}
      />,
    );

    expect(screen.queryByRole('button', { name: /Message host/ })).not.toBeInTheDocument();
  });

  it('shows the host community as a row to its own page', () => {
    render(
      <ExperienceHostSection
        experience={experience({ hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' } })}
      />,
    );

    expect(screen.getByText('Nairobi Makers Circle')).toBeInTheDocument();
    expect(screen.getByText('Host community')).toBeInTheDocument();
  });

  it('renders nothing for an experience with neither a host nor a host community', () => {
    const { container } = render(<ExperienceHostSection experience={experience({})} />);

    expect(container).toBeEmptyDOMElement();
  });
});
