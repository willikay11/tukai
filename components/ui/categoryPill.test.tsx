import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CategoryPill } from './categoryPill';

const category = { id: 'c1', name: 'Hiking', icon: 'MountainIcon' } as never;

describe('CategoryPill', () => {
  // The same gradient the pill radio group and the property pills use, rather
  // than the flat primary it carried on its own
  it('takes the gradient once chosen', () => {
    render(<CategoryPill category={category} isSelected onClick={jest.fn()} />);

    const pill = screen.getByText('Hiking').closest('div[class*="rounded-full"]');
    expect(pill).toHaveClass('bg-gradient-to-b', 'text-white');
    expect(pill).not.toHaveClass('bg-primary');
  });

  it('sits on grey until it is', () => {
    render(<CategoryPill category={category} isSelected={false} onClick={jest.fn()} />);

    const pill = screen.getByText('Hiking').closest('div[class*="rounded-full"]');
    expect(pill).toHaveClass('bg-gray-100');
    expect(pill).not.toHaveClass('bg-gradient-to-b');
  });

  it('reports the category it was given', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<CategoryPill category={category} isSelected={false} onClick={onClick} />);

    await user.click(screen.getByText('Hiking'));

    expect(onClick).toHaveBeenCalledWith('c1');
  });
});
