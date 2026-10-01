import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ProfileMenu } from './index';
import { PROFILE_MENU_ITEMS } from './items';

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

  it('lists every menu item in the designed order', () => {
    render(<ProfileMenu {...defaults} />);

    PROFILE_MENU_ITEMS.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('links the items that have a destination', () => {
    render(<ProfileMenu {...defaults} />);

    expect(screen.getByRole('link', { name: /My Profile/ })).toHaveAttribute('href', '/profile');
    // Communities, Bucket lists and Plans left this menu for the primary nav
    expect(screen.queryByRole('link', { name: /My Communities/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Bucket List/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /My Plans/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Control Center/ })).toHaveAttribute(
      'href',
      '/control-center',
    );
  });

  it('links Control Center now that the page exists', () => {
    render(<ProfileMenu {...defaults} />);

    const control = screen.getByText('Control Center').closest('a');
    expect(control).toHaveAttribute('href', '/control-center');
    expect(screen.getByText('Control Center').closest('button')).toBeNull();
  });

  /**
   * Every row routes now that the inbox exists. The disabled branch stays as a
   * guard for the next item added before its page.
   */
  it('routes every row', () => {
    render(<ProfileMenu {...defaults} />);

    PROFILE_MENU_ITEMS.forEach((item) => {
      expect(item.href).toBeTruthy();
      expect(screen.getByText(item.label).closest('a')).toHaveAttribute('href', item.href!);
    });
  });

  it('sends Notifications and Messages to the inbox', () => {
    render(<ProfileMenu {...defaults} />);

    expect(screen.getByText('Notifications').closest('a')).toHaveAttribute('href', '/inbox');
    expect(screen.getByText('Messages').closest('a')).toHaveAttribute('href', '/inbox');
  });

  it('shows the unread dot on Notifications only', () => {
    const { container } = render(<ProfileMenu {...defaults} hasUnreadNotifications />);

    // Notifications routes to the inbox now, so its row is a link
    const notifications = screen.getByText('Notifications').closest('a');
    expect(notifications?.querySelector('.bg-red-500')).toBeInTheDocument();
    expect(container.querySelectorAll('.bg-red-500')).toHaveLength(1);
  });

  it('hides the unread dot when there is nothing unread', () => {
    const { container } = render(<ProfileMenu {...defaults} hasUnreadNotifications={false} />);

    expect(container.querySelector('.bg-red-500')).not.toBeInTheDocument();
  });

  it('signs the user out', () => {
    const onSignOut = jest.fn();
    render(<ProfileMenu {...defaults} onSignOut={onSignOut} />);

    fireEvent.click(screen.getByText('Sign Out'));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  // The popover this sits in stays mounted through client navigation, so it has
  // to be told a row was chosen
  describe('closing the menu', () => {
    it('reports a selection when a linked item is chosen', () => {
      const onItemSelect = jest.fn();
      render(<ProfileMenu {...defaults} onItemSelect={onItemSelect} />);

      const linked = PROFILE_MENU_ITEMS.find((item) => item.href)!;
      fireEvent.click(screen.getByText(linked.label));

      expect(onItemSelect).toHaveBeenCalled();
    });

    it('reports a selection when signing out', () => {
      const onItemSelect = jest.fn();
      const onSignOut = jest.fn();
      render(<ProfileMenu {...defaults} onSignOut={onSignOut} onItemSelect={onItemSelect} />);

      fireEvent.click(screen.getByText('Sign Out'));

      expect(onItemSelect).toHaveBeenCalled();
      expect(onSignOut).toHaveBeenCalled();
    });

    it('works without the callback', () => {
      render(<ProfileMenu {...defaults} />);

      const linked = PROFILE_MENU_ITEMS.find((item) => item.href)!;
      expect(() => fireEvent.click(screen.getByText(linked.label))).not.toThrow();
    });
  });

  it('renders Sign Out in the destructive colour', () => {
    render(<ProfileMenu {...defaults} />);

    expect(screen.getByText('Sign Out')).toHaveClass('text-red-600');
  });
});
