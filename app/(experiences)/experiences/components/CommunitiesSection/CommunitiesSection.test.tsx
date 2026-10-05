import React from 'react';

import { render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunitiesSection } from './index';

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
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/(experiences)/components/CommunityRow', () => ({
  CommunityRow: ({ community }: { community: Community }) => <div>{community.title}</div>,
}));

const community = (id: string, title: string) => ({ id, title }) as unknown as Community;

const someCommunities = [community('1', 'Weekend Readers'), community('2', 'Nairobi Hikers')];

describe('CommunitiesSection', () => {
  it('uses the heading and a subtitle with no city', () => {
    render(<CommunitiesSection communities={someCommunities} total={2} isLoading={false} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^Communities$/);
    expect(screen.getByText('Running what is on')).toBeInTheDocument();
    expect(screen.queryByText(/Nairobi$/)).not.toBeInTheDocument();
  });

  it('shows a row for each community', () => {
    render(<CommunitiesSection communities={someCommunities} total={2} isLoading={false} />);

    expect(screen.getByText('Weekend Readers')).toBeInTheDocument();
    expect(screen.getByText('Nairobi Hikers')).toBeInTheDocument();
  });

  it('is hidden when there are no communities', () => {
    const { container } = render(
      <CommunitiesSection communities={[]} total={0} isLoading={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('is shown while loading, before any community has arrived', () => {
    render(<CommunitiesSection communities={[]} total={0} isLoading />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Communities');
  });

  it('offers See all when the API holds more than the grid shows', () => {
    render(<CommunitiesSection communities={someCommunities} total={12} isLoading={false} />);

    expect(screen.getByRole('link', { name: /See all/ })).toHaveAttribute('href', '/communities');
  });

  it('leaves See all out when the grid shows every community there is', () => {
    render(<CommunitiesSection communities={someCommunities} total={2} isLoading={false} />);

    expect(screen.queryByRole('link', { name: /See all/ })).not.toBeInTheDocument();
  });

  it('shows at most eight communities', () => {
    const many = Array.from({ length: 10 }, (_, index) => community(`${index}`, `Club ${index}`));

    render(<CommunitiesSection communities={many} total={10} isLoading={false} />);

    expect(screen.getByText('Club 7')).toBeInTheDocument();
    expect(screen.queryByText('Club 8')).not.toBeInTheDocument();
  });
});
