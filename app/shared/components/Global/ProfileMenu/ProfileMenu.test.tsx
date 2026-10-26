import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ProfileMenu } from './index';
import { PROFILE_MENU_GROUP_ONE, PROFILE_MENU_GROUP_TWO } from './items';

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
jest.mock('@/components/ui/image', () => ({
  TukaiImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const defaults = { name: 'George Ralak', onSignOut: jest.fn() };
const ALL_ITEMS = [...PROFILE_MENU_GROUP_ONE, ...PROFILE_MENU_GROUP_TWO];

describe('ProfileMenu', () => {
  it('shows the user name and handle', () => {
    render(<ProfileMenu {...defaults} handle="georgeralak" />);

    expect(screen.getByText('George Ralak')).toBeInTheDocument();
    expect(screen.getByText('@georgeralak')).toBeInTheDocument();
  });

  // Not every user has set a display name; inventing one would be wrong
  it('omits the handle line when the user has none', () => {
    render(<ProfileMenu {...defaults} handle={null} />);

    expect(screen.getByText('George Ralak')).toBeInTheDocument();
    expect(screen.queryByText(/^@/)).not.toBeInTheDocument();
  });

  it('lists every row from both groups', () => {
    render(<ProfileMenu {...defaults} />);

    ALL_ITEMS.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('links the header row to the profile, not a listed row', () => {
    render(<ProfileMenu {...defaults} />);

    // The header row is the way to the profile; there is no plain "Profile" row
    expect(screen.getByRole('menuitem', { name: /George Ralak/ })).toHaveAttribute(
      'href',
      '/profile',
    );
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('links Dashboard to Control Center', () => {
    render(<ProfileMenu {...defaults} />);

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/control-center');
  });

  it('routes every row', () => {
    render(<ProfileMenu {...defaults} />);

    ALL_ITEMS.forEach((item) => {
      expect(item.href).toBeTruthy();
      expect(screen.getByText(item.label).closest('a')).toHaveAttribute('href', item.href!);
    });
  });

  it('sends Notifications and Messages to the inbox', () => {
    render(<ProfileMenu {...defaults} />);

    expect(screen.getByText('Notifications').closest('a')).toHaveAttribute('href', '/inbox');
    expect(screen.getByText('Messages').closest('a')).toHaveAttribute('href', '/inbox');
  });

  it('shows the unread count as a badge on Notifications only', () => {
    render(<ProfileMenu {...defaults} unreadNotificationCount={3} />);

    const notifications = screen.getByText('Notifications').closest('a');
    expect(notifications).toHaveTextContent('3');
  });

  it('hides the badge when there is nothing unread', () => {
    render(<ProfileMenu {...defaults} unreadNotificationCount={0} />);

    const notifications = screen.getByText('Notifications').closest('a');
    expect(notifications).toHaveTextContent('Notifications');
    expect(notifications?.textContent).toBe('Notifications');
  });

  it('signs the user out', () => {
    const onSignOut = jest.fn();
    render(<ProfileMenu {...defaults} onSignOut={onSignOut} />);

    fireEvent.click(screen.getByText('Sign out'));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  // The popover this sits in stays mounted through client navigation, so it has
  // to be told a row was chosen
  describe('closing the menu', () => {
    it('reports a selection when a linked item is chosen', () => {
      const onItemSelect = jest.fn();
      render(<ProfileMenu {...defaults} onItemSelect={onItemSelect} />);

      const linked = ALL_ITEMS.find((item) => item.href)!;
      fireEvent.click(screen.getByText(linked.label));

      expect(onItemSelect).toHaveBeenCalled();
    });

    it('reports a selection when signing out', () => {
      const onItemSelect = jest.fn();
      const onSignOut = jest.fn();
      render(<ProfileMenu {...defaults} onSignOut={onSignOut} onItemSelect={onItemSelect} />);

      fireEvent.click(screen.getByText('Sign out'));

      expect(onItemSelect).toHaveBeenCalled();
      expect(onSignOut).toHaveBeenCalled();
    });

    it('works without the callback', () => {
      render(<ProfileMenu {...defaults} />);

      const linked = ALL_ITEMS.find((item) => item.href)!;
      expect(() => fireEvent.click(screen.getByText(linked.label))).not.toThrow();
    });
  });

  it('renders Sign out in the destructive colour', () => {
    render(<ProfileMenu {...defaults} />);

    expect(screen.getByText('Sign out')).toHaveClass('text-danger');
  });
});
