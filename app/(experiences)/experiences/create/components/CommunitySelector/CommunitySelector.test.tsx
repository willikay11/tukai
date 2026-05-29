import { render, screen } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';

import { type Community, CommunitySelector } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children, className }: any) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

const mockCommunities: Community[] = [
  {
    id: 'comm-1',
    name: 'Hiking Community',
    imageUrl: 'https://example.com/hiking.jpg',
  },
  {
    id: 'comm-2',
    name: 'Photography Club',
    imageUrl: 'https://example.com/photo.jpg',
  },
  {
    id: 'comm-3',
    name: 'Cooking Enthusiasts',
    imageUrl: 'https://example.com/cooking.jpg',
  },
];

describe('CommunitySelector', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const onChange = jest.fn();
      const { container } = rtlRender(
        <CommunitySelector value={null} options={mockCommunities} onChange={onChange} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the label', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);
      expect(screen.getByText('Select host community')).toBeInTheDocument();
    });

    it('renders info button', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);
      expect(screen.getByText('InformationCircleIcon')).toBeInTheDocument();
    });

    it('renders info popover content', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);
      expect(
        screen.getByText('Select a community you created to host this experience'),
      ).toBeInTheDocument();
    });

    it('renders select trigger', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });
  });

  describe('No Selection State', () => {
    it('displays placeholder when no community selected', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);
      expect(screen.getByText('Select a community')).toBeInTheDocument();
    });

    it('displays select content with options', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
    });
  });

  describe('Community Display', () => {
    it('displays selected community in trigger', () => {
      const onChange = jest.fn();
      rtlRender(
        <CommunitySelector
          value={mockCommunities[0]}
          options={mockCommunities}
          onChange={onChange}
        />,
      );
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger.textContent).toContain('Hiking Community');
    });

    it('displays selected community image', () => {
      const onChange = jest.fn();
      const { container } = rtlRender(
        <CommunitySelector
          value={mockCommunities[0]}
          options={mockCommunities}
          onChange={onChange}
        />,
      );
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('displays all available communities in options', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);

      mockCommunities.forEach((community) => {
        expect(screen.getByTestId(`select-item-${community.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows no communities available message when empty', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={[]} onChange={onChange} />);
      expect(screen.getByText('No communities available')).toBeInTheDocument();
    });

    it('does not show select items when no options', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={[]} onChange={onChange} />);
      expect(screen.queryByTestId('select-item-comm-1')).not.toBeInTheDocument();
    });
  });

  describe('Selection Changes', () => {
    it('updates selected community when value prop changes', () => {
      const onChange = jest.fn();
      const { rerender } = rtlRender(
        <CommunitySelector value={null} options={mockCommunities} onChange={onChange} />,
      );

      expect(screen.getByText('Select a community')).toBeInTheDocument();

      rerender(
        <CommunitySelector
          value={mockCommunities[0]}
          options={mockCommunities}
          onChange={onChange}
        />,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger.textContent).toContain('Hiking Community');
    });

    it('switches between different communities', () => {
      const onChange = jest.fn();
      const { rerender } = rtlRender(
        <CommunitySelector
          value={mockCommunities[0]}
          options={mockCommunities}
          onChange={onChange}
        />,
      );

      let trigger = screen.getByTestId('select-trigger');
      expect(trigger.textContent).toContain('Hiking Community');

      rerender(
        <CommunitySelector
          value={mockCommunities[1]}
          options={mockCommunities}
          onChange={onChange}
        />,
      );

      trigger = screen.getByTestId('select-trigger');
      expect(trigger.textContent).toContain('Photography Club');
    });
  });

  describe('Error State', () => {
    it('displays error message when error is provided', () => {
      const onChange = jest.fn();
      rtlRender(
        <CommunitySelector
          value={null}
          options={mockCommunities}
          onChange={onChange}
          error="Please select a community"
        />,
      );
      expect(screen.getByText('Please select a community')).toBeInTheDocument();
    });

    it('applies red border styling when error exists', () => {
      const onChange = jest.fn();
      const { container } = rtlRender(
        <CommunitySelector
          value={null}
          options={mockCommunities}
          onChange={onChange}
          error="Error"
        />,
      );
      const trigger = container.querySelector('[data-testid="select-trigger"]');
      expect(trigger?.className).toContain('border-red-500');
    });

    it('removes error styling when error is cleared', () => {
      const onChange = jest.fn();
      const { container, rerender } = rtlRender(
        <CommunitySelector
          value={null}
          options={mockCommunities}
          onChange={onChange}
          error="Error"
        />,
      );

      let trigger = container.querySelector('[data-testid="select-trigger"]');
      expect(trigger?.className).toContain('border-red-500');

      rerender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);

      trigger = container.querySelector('[data-testid="select-trigger"]');
      expect(trigger?.className).not.toContain('border-red-500');
    });
  });

  describe('Accessibility', () => {
    it('has accessible label', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);
      const label = screen.getByText('Select host community');
      expect(label).toBeInTheDocument();
    });

    it('info button has aria label', () => {
      const onChange = jest.fn();
      rtlRender(<CommunitySelector value={null} options={mockCommunities} onChange={onChange} />);
      const infoButton = screen.getByRole('button');
      expect(infoButton.getAttribute('aria-label')).toBe('Information about community selection');
    });
  });

  describe('Community Image Handling', () => {
    it('handles communities without images', () => {
      const communityNoImage: Community = {
        id: 'comm-4',
        name: 'No Image Community',
        imageUrl: '',
      };

      const onChange = jest.fn();
      const { container } = rtlRender(
        <CommunitySelector
          value={communityNoImage}
          options={[communityNoImage]}
          onChange={onChange}
        />,
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger.textContent).toContain('No Image Community');
      expect(container).toBeInTheDocument();
    });
  });
});
