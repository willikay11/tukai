import React from 'react';

import { render, screen } from '@testing-library/react';

import { PlaceSocialLink } from '@/types/place';

import { PlaceSocialPills } from './PlaceSocialPills';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName, size }: { iconName: string; size: number }) => (
    <span data-testid={iconName} data-size={size} />
  ),
}));

const makeLink = (overrides: Partial<PlaceSocialLink>): PlaceSocialLink => ({
  id: 'x',
  platformName: 'Instagram',
  url: 'https://instagram.com/place',
  ...overrides,
});

describe('PlaceSocialPills', () => {
  it('renders nothing when there are no links', () => {
    const { container } = render(<PlaceSocialPills links={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens each link in a new tab', () => {
    render(<PlaceSocialPills links={[makeLink({ id: 'a', platformName: 'Instagram' })]} />);

    const pill = screen.getByRole('link', { name: 'Instagram' });
    expect(pill).toHaveAttribute('href', 'https://instagram.com/place');
    expect(pill).toHaveAttribute('target', '_blank');
    expect(pill).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('keeps the row on one line so it scrolls sideways', () => {
    render(
      <PlaceSocialPills
        links={[
          makeLink({ id: 'a', platformName: 'Instagram' }),
          makeLink({ id: 'b', platformName: 'TikTok' }),
        ]}
      />,
    );

    const row = screen.getByRole('link', { name: 'Instagram' }).parentElement;
    expect(row).toHaveClass('overflow-x-auto', 'flex', 'scrollbar-hide');
    expect(row).not.toHaveClass('flex-wrap');
  });

  it('sizes each pill to the design: 44px tall, 19px icon, 14.5px label', () => {
    render(<PlaceSocialPills links={[makeLink({ icon: 'InstagramIcon' })]} />);

    const pill = screen.getByRole('link', { name: 'Instagram' });
    expect(pill).toHaveClass('h-11', 'shrink-0', 'text-[14.5px]', 'font-medium');
    expect(screen.getByTestId('InstagramIcon')).toHaveAttribute('data-size', '19');
  });
});
