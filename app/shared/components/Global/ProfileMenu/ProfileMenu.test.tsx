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

    expect(screen.getByRole('link', { name: /My Profile/ })).toHaveAttribute(
      'href',
      '/auth/profile',
    );
    expect(screen.getByRole('link', { name: /My Communities/ })).toHaveAttribute(
      'href',
      '/communities?category=my-communities',
    );
    expect(screen.getByRole('link', { name: /Creator Studio/ })).toHaveAttribute(
      'href',
      '/creator-studio',
    );
  });

  it('links Creator Studio now that the page exists', () => {
    render(<ProfileMenu {...defaults} />);

    const control = screen.getByText('Creator Studio').closest('a');
    expect(control).toHaveAttribute('href', '/creator-studio');
    expect(screen.getByText('Creator Studio').closest('button')).toBeNull();
  });

  // Bucket List, Notifications, Messages and Creator Studio have no page yet
  it('disables items whose destination does not exist rather than linking to a 404', () => {
    render(<ProfileMenu {...defaults} />);

    PROFILE_MENU_ITEMS.filter((item) => !item.href).forEach((item) => {
      const control = screen.getByText(item.label).closest('button');
      expect(control).toBeDisabled();
    });
  });

  it('shows the unread dot on Notifications only', () => {
    const { container } = render(<ProfileMenu {...defaults} hasUnreadNotifications />);

    const notifications = screen.getByText('Notifications').closest('button');
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

  it('renders Sign Out in the destructive colour', () => {
    render(<ProfileMenu {...defaults} />);

    expect(screen.getByText('Sign Out')).toHaveClass('text-red-600');
  });
});
