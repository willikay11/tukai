import { render, screen } from '@testing-library/react';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

import { PreviewGuestsSection } from './index';
import type { Experience } from '@/types/experience';

describe('PreviewGuestsSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(
        <PreviewGuestsSection guests={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the heading with guest count', () => {
      render(<PreviewGuestsSection guests={[]} />);
      expect(screen.getByText('Guests (0)')).toBeInTheDocument();
    });

    it('renders edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(
        <PreviewGuestsSection guests={[]} onEdit={onEdit} />
      );
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit not provided', () => {
      render(<PreviewGuestsSection guests={[]} />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays "No guests invited yet" when no guests', () => {
      render(<PreviewGuestsSection guests={[]} />);
      expect(screen.getByText('No guests invited yet')).toBeInTheDocument();
    });
  });

  describe('Guest Display', () => {
    const mockGuests: Experience['guests'] = [
      { id: '1', email: 'john@example.com' },
      { id: '2', email: 'jane@example.com' },
      { id: '3', email: 'bob@example.com' },
    ];

    it('displays guest emails', () => {
      render(<PreviewGuestsSection guests={mockGuests} />);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('displays initials for each guest', () => {
      const { container } = render(<PreviewGuestsSection guests={mockGuests} />);
      // Guests are displayed with emails
      expect(container.textContent).toContain('john@example.com');
      expect(container.textContent).toContain('jane@example.com');
      expect(container.textContent).toContain('bob@example.com');
    });

    it('updates guest count in heading', () => {
      render(<PreviewGuestsSection guests={mockGuests} />);
      expect(screen.getByText('Guests (3)')).toBeInTheDocument();
    });

    it('displays single guest', () => {
      render(<PreviewGuestsSection guests={[{ id: '1', email: 'test@example.com' }]} />);
      expect(screen.getByText('Guests (1)')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('Overflow Handling', () => {
    it('shows overflow badge when more than 8 guests', () => {
      const manyGuests = Array.from({ length: 12 }, (_, i) => ({
        id: `${i}`,
        email: `guest${i}@example.com`,
      }));
      render(<PreviewGuestsSection guests={manyGuests} />);
      expect(screen.getByText('+4')).toBeInTheDocument();
    });

    it('shows exactly 8 guest avatars and overflow count', () => {
      const manyGuests = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        email: `guest${i}@example.com`,
      }));
      render(<PreviewGuestsSection guests={manyGuests} />);
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('does not show overflow badge when exactly 8 guests', () => {
      const eightGuests = Array.from({ length: 8 }, (_, i) => ({
        id: `${i}`,
        email: `guest${i}@example.com`,
      }));
      render(<PreviewGuestsSection guests={eightGuests} />);
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it('does not show overflow badge when less than 8 guests', () => {
      const fewGuests = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`,
        email: `guest${i}@example.com`,
      }));
      render(<PreviewGuestsSection guests={fewGuests} />);
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      const mockGuests = [{ id: '1', email: 'test@example.com' }];
      render(
        <PreviewGuestsSection guests={mockGuests} onEdit={onEdit} />
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Props Updates', () => {
    it('updates guests when prop changes', () => {
      const oldGuests = [{ id: '1', email: 'old@example.com' }];
      const newGuests = [
        { id: '2', email: 'new1@example.com' },
        { id: '3', email: 'new2@example.com' },
      ];

      const { rerender } = render(<PreviewGuestsSection guests={oldGuests} />);
      expect(screen.getByText('Guests (1)')).toBeInTheDocument();

      rerender(<PreviewGuestsSection guests={newGuests} />);
      expect(screen.getByText('Guests (2)')).toBeInTheDocument();
    });

    it('transitions from empty to filled state', () => {
      const { rerender } = render(<PreviewGuestsSection guests={[]} />);
      expect(screen.getByText('No guests invited yet')).toBeInTheDocument();

      rerender(
        <PreviewGuestsSection
          guests={[{ id: '1', email: 'guest@example.com' }]}
        />
      );
      expect(screen.queryByText('No guests invited yet')).not.toBeInTheDocument();
      expect(screen.getByText('guest@example.com')).toBeInTheDocument();
    });
  });

  describe('Email Initials', () => {
    it('handles single character email', () => {
      const { container } = render(
        <PreviewGuestsSection guests={[{ id: '1', email: 'a@example.com' }]} />
      );
      expect(container.textContent).toContain('a@example.com');
    });

    it('handles email with numbers', () => {
      const { container } = render(
        <PreviewGuestsSection guests={[{ id: '1', email: 'john123@example.com' }]} />
      );
      expect(container.textContent).toContain('john123@example.com');
    });

    it('handles email with special characters', () => {
      const { container } = render(
        <PreviewGuestsSection guests={[{ id: '1', email: 'john.doe@example.com' }]} />
      );
      expect(container.textContent).toContain('john.doe@example.com');
    });
  });

  describe('Accessibility', () => {
    it('has semantic heading', () => {
      render(<PreviewGuestsSection guests={[]} />);
      const heading = screen.getByText('Guests (0)');
      expect(heading.tagName).toBe('H3');
    });

    it('avatar has email as title', () => {
      const mockGuests = [{ id: '1', email: 'john@example.com' }];
      const { container } = render(<PreviewGuestsSection guests={mockGuests} />);
      const avatar = container.querySelector('[title="john@example.com"]');
      expect(avatar).toBeInTheDocument();
    });
  });
});
