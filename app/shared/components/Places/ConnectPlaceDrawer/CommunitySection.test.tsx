import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunitySection, CommunitySectionProps } from './CommunitySection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const community = { id: 'c1', title: 'Weekend Readers', photos: [] } as unknown as Community;

const renderSection = (overrides: Partial<CommunitySectionProps> = {}) => {
  const props: CommunitySectionProps = {
    communities: [community],
    isLoadingCommunities: false,
    selectedCommunityId: '',
    onSelect: jest.fn(),
    isNewCommunityBoxOpen: false,
    setIsNewCommunityBoxOpen: jest.fn(),
    canCloseNewCommunityBox: true,
    newCommunityName: '',
    setNewCommunityName: jest.fn(),
    newCommunityVisibility: 'public',
    setNewCommunityVisibility: jest.fn(),
    isCreatingCommunity: false,
    onCreateCommunity: jest.fn(),
    ...overrides,
  };
  render(<CommunitySection {...props} />);
  return props;
};

describe('CommunitySection', () => {
  it('explains what the community does only after the info button is pressed', () => {
    renderSection();
    const info = screen.getByRole('button', { name: 'What the community does' });
    expect(screen.queryByText(/The community you pick owns the place/)).not.toBeInTheDocument();
    expect(info).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(info);

    expect(screen.getByText(/The community you pick owns the place/)).toBeInTheDocument();
    expect(info).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(info);

    expect(screen.queryByText(/The community you pick owns the place/)).not.toBeInTheDocument();
  });

  it('puts an icon on Create a community and opens the new community box from it', () => {
    const props = renderSection();

    const create = screen.getByRole('button', { name: /Create a community/ });
    expect(create).toContainElement(screen.getByTestId('UserAdd02Icon'));

    fireEvent.click(create);

    expect(props.setIsNewCommunityBoxOpen).toHaveBeenCalledWith(true);
  });

  it('selects a community from the list', () => {
    const props = renderSection();

    fireEvent.click(screen.getByRole('radio', { name: /Weekend Readers/ }));

    expect(props.onSelect).toHaveBeenCalledWith('c1');
  });

  it('marks the selected community as checked', () => {
    renderSection({ selectedCommunityId: 'c1' });

    expect(screen.getByRole('radio', { name: /Weekend Readers/ })).toBeChecked();
  });

  it('hides Create a community while the new community box is open', () => {
    renderSection({ isNewCommunityBoxOpen: true });

    expect(screen.queryByRole('button', { name: /Create a community/ })).not.toBeInTheDocument();
    expect(screen.getByText('New community')).toBeInTheDocument();
  });

  it('keeps the new community box open when the reader has no community to go back to', () => {
    renderSection({ communities: [], isNewCommunityBoxOpen: true, canCloseNewCommunityBox: false });

    expect(screen.queryByRole('button', { name: 'Close new community' })).not.toBeInTheDocument();
  });

  it('only lets a named community be created', () => {
    renderSection({ isNewCommunityBoxOpen: true, newCommunityName: '   ' });

    expect(screen.getByRole('button', { name: 'Create community' })).toBeDisabled();
  });

  it('creates the community once it has a name', () => {
    const props = renderSection({ isNewCommunityBoxOpen: true, newCommunityName: 'Book Club' });

    fireEvent.click(screen.getByRole('button', { name: 'Create community' }));

    expect(props.onCreateCommunity).toHaveBeenCalledTimes(1);
  });
});
