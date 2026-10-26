import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SortMenu } from './SortMenu';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

// Radix's dropdown menu needs these before it will open in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
});

describe('SortMenu', () => {
  it('names the current sort on the button', () => {
    render(<SortMenu value="near" options={['rec', 'near']} onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Sort by' })).toHaveTextContent('Nearest first');
  });

  it('reads Recommended for the default', () => {
    render(<SortMenu value="rec" options={['rec', 'near']} onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Sort by' })).toHaveTextContent('Recommended');
  });

  it('offers only the given options, in the design’s order', async () => {
    const user = userEvent.setup();
    render(<SortMenu value="rec" options={['rec', 'near', 'price']} onChange={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Sort by' }));

    expect(screen.getAllByRole('menuitemradio').map((item) => item.textContent)).toEqual([
      'Recommended',
      'Nearest first',
      'Lowest price',
    ]);
    expect(screen.queryByRole('menuitemradio', { name: /Soonest/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitemradio', { name: /Top rated/ })).not.toBeInTheDocument();
  });

  it('checks the current option', async () => {
    const user = userEvent.setup();
    render(<SortMenu value="near" options={['rec', 'near']} onChange={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Sort by' }));

    expect(screen.getByRole('menuitemradio', { name: 'Nearest first' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Recommended' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('applies the pick straight away and closes the menu', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<SortMenu value="rec" options={['rec', 'near']} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Sort by' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Nearest first' }));

    expect(onChange).toHaveBeenCalledWith('near');
    expect(screen.queryByRole('menuitemradio')).not.toBeInTheDocument();
  });

  // The dropdown-menu primitive gives roving focus, Enter/Space and Escape
  // for free - this is a regression guard for that wiring staying in place
  describe('the keyboard', () => {
    // DropdownMenu doesn't expose an entry-focus override (see the
    // component's own doc comment) - it opens onto the first option
    it('opens on Enter and focuses the first option', async () => {
      const user = userEvent.setup();
      render(<SortMenu value="near" options={['rec', 'near', 'price']} onChange={jest.fn()} />);

      screen.getByRole('button', { name: 'Sort by' }).focus();
      await user.keyboard('{Enter}');

      expect(await screen.findByRole('menuitemradio', { name: 'Recommended' })).toHaveFocus();
    });

    it('moves focus with the arrow keys and picks with Enter', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<SortMenu value="rec" options={['rec', 'near', 'price']} onChange={onChange} />);

      screen.getByRole('button', { name: 'Sort by' }).focus();
      await user.keyboard('{Enter}'); // opens on Recommended
      await user.keyboard('{ArrowDown}'); // Nearest first
      await user.keyboard('{ArrowDown}'); // Lowest price
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith('price');
    });

    it('closes on Escape without picking, and returns focus to the button', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<SortMenu value="rec" options={['rec', 'near']} onChange={onChange} />);

      const button = screen.getByRole('button', { name: 'Sort by' });
      await user.click(button);
      await user.keyboard('{Escape}');

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('menuitemradio')).not.toBeInTheDocument();
      expect(button).toHaveFocus();
    });
  });
});
