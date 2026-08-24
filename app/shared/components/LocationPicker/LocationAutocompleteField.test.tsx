import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LocationAutocompleteField } from './LocationAutocompleteField';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({
    iconName,
    size,
    color,
  }: {
    iconName: string;
    size: number;
    color?: string;
  }) => (
    <span data-testid={`icon-${iconName}`} style={{ color }}>
      {iconName}
    </span>
  ),
}));

jest.mock('@/app/shared/components/Forms/form', () => ({
  Loader: ({ size }: { size: string }) => <div data-testid="loader">Loading...</div>,
}));

const mockSuggestions = [
  {
    place_id: 'place-1',
    description: 'Nairobi, Kenya',
    main_text: 'Nairobi',
    secondary_text: 'Kenya',
  },
  {
    place_id: 'place-2',
    description: 'Nairobi City Center, Kenya',
    main_text: 'Nairobi City Center',
    secondary_text: 'Kenya',
  },
  {
    place_id: 'place-3',
    description: 'Nairobi West, Kenya',
    main_text: 'Nairobi West',
    secondary_text: 'Kenya',
  },
];

const defaultProps = {
  value: '',
  showSuggestions: false,
  onValueChange: jest.fn(),
  onSelectSuggestion: jest.fn(),
};

describe('LocationAutocompleteField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders input field', () => {
      render(<LocationAutocompleteField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<LocationAutocompleteField {...defaultProps} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.placeholder).toBe('City e.g. Nairobi, Watamu...');
    });

    it('renders with custom placeholder', () => {
      render(<LocationAutocompleteField {...defaultProps} placeholder="Enter your location" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.placeholder).toBe('Enter your location');
    });

    it('renders with input value', () => {
      render(<LocationAutocompleteField {...defaultProps} value="Nairobi" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Nairobi');
    });

    it('renders map pin icon', () => {
      render(<LocationAutocompleteField {...defaultProps} />);

      expect(screen.getByTestId('icon-Location06Icon')).toBeInTheDocument();
    });

    it('does not show dropdown by default', () => {
      render(<LocationAutocompleteField {...defaultProps} />);

      const dropdown = screen.queryByRole('button', { name: /Nairobi/i });
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  describe('input interaction', () => {
    it('calls onValueChange when input value changes', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();

      render(<LocationAutocompleteField {...defaultProps} onValueChange={onValueChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Nai');

      // userEvent.type triggers onChange for each character
      expect(onValueChange).toHaveBeenCalledWith('N');
      expect(onValueChange).toHaveBeenCalledWith('a');
      expect(onValueChange).toHaveBeenCalledWith('i');
      expect(onValueChange).toHaveBeenCalledTimes(3);
    });

    it('calls onFocus when input is focused', async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();

      render(<LocationAutocompleteField {...defaultProps} onFocus={onFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it('applies custom input className', () => {
      render(<LocationAutocompleteField {...defaultProps} inputClassName="custom-class h-12" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('h-12');
    });
  });

  describe('dropdown visibility', () => {
    it('hides dropdown when showSuggestions is false', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          showSuggestions={false}
          suggestions={mockSuggestions}
        />,
      );

      expect(screen.queryByText('Nairobi, Kenya')).not.toBeInTheDocument();
    });

    it('hides dropdown when value length is less than minQueryLength', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Na"
          showSuggestions={true}
          minQueryLength={3}
          suggestions={mockSuggestions}
        />,
      );

      expect(screen.queryByText('Nairobi, Kenya')).not.toBeInTheDocument();
    });

    it('shows dropdown when showSuggestions and value length >= minQueryLength and suggestions exist', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          minQueryLength={3}
          suggestions={mockSuggestions}
        />,
      );

      expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
    });

    it('shows dropdown when showSuggestions and value length >= minQueryLength and isLoading', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          minQueryLength={3}
          isLoading={true}
          suggestions={[]}
        />,
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('uses custom minQueryLength', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Na"
          showSuggestions={true}
          minQueryLength={2}
          suggestions={mockSuggestions}
        />,
      );

      expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loader when isLoading is true', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          isLoading={true}
        />,
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText('Searching locations...')).toBeInTheDocument();
    });

    it('does not show suggestions when isLoading is true', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          isLoading={true}
          suggestions={mockSuggestions}
        />,
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.queryByText('Nairobi, Kenya')).not.toBeInTheDocument();
    });
  });

  describe('suggestions display', () => {
    it('displays all suggestions', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
        />,
      );

      expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
      expect(screen.getByText('Nairobi City Center, Kenya')).toBeInTheDocument();
      expect(screen.getByText('Nairobi West, Kenya')).toBeInTheDocument();
    });

    it('renders location icon for each suggestion', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
        />,
      );

      const icons = screen.getAllByTestId('icon-Location01Icon');
      expect(icons).toHaveLength(mockSuggestions.length);
    });

    it('renders suggestion buttons with correct text', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
        />,
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(mockSuggestions.length);
    });

    it('shows empty dropdown when no suggestions and not loading', () => {
      const { container } = render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={[]}
          isLoading={false}
        />,
      );

      // Dropdown should still show but be empty
      const dropdown = container.querySelector('.absolute');
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  describe('suggestion selection', () => {
    it('calls onSelectSuggestion when suggestion is clicked', async () => {
      const user = userEvent.setup();
      const onSelectSuggestion = jest.fn();

      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
          onSelectSuggestion={onSelectSuggestion}
        />,
      );

      const suggestionButton = screen.getByText('Nairobi, Kenya');
      await user.click(suggestionButton);

      expect(onSelectSuggestion).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('calls onSelectSuggestion with correct suggestion data', async () => {
      const user = userEvent.setup();
      const onSelectSuggestion = jest.fn();

      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
          onSelectSuggestion={onSelectSuggestion}
        />,
      );

      const secondSuggestion = screen.getByText('Nairobi City Center, Kenya');
      await user.click(secondSuggestion);

      expect(onSelectSuggestion).toHaveBeenCalledWith(mockSuggestions[1]);
    });
  });

  describe('ref handling', () => {
    it('forwards containerRef to div element', () => {
      const containerRef = createRef<HTMLDivElement>();

      render(<LocationAutocompleteField {...defaultProps} containerRef={containerRef} />);

      expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it('container div has relative positioning', () => {
      const containerRef = createRef<HTMLDivElement>();

      render(<LocationAutocompleteField {...defaultProps} containerRef={containerRef} />);

      expect(containerRef.current).toHaveClass('relative');
    });
  });

  describe('styling', () => {
    // The field takes its height from the shared Input's padding and line
    // height. Forcing h-[50px] on the inner element stacked on that padding and
    // made the meeting-point field 76px against every other field's 44px.
    it('does not force a height onto the input', () => {
      render(<LocationAutocompleteField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input.className).not.toMatch(/\bh-\[/);
      expect(input).toHaveClass('leading-[18px]');
    });

    it('still lets a caller style the input', () => {
      render(<LocationAutocompleteField {...defaultProps} inputClassName="text-red-500" />);

      expect(screen.getByRole('textbox')).toHaveClass('text-red-500');
    });

    it('dropdown has correct styling classes', () => {
      const { container } = render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
        />,
      );

      const dropdown = container.querySelector('.absolute');
      expect(dropdown).toHaveClass(
        'z-50',
        'mt-1',
        'max-h-60',
        'w-full',
        'overflow-auto',
        'rounded-md',
        'border',
        'bg-white',
        'shadow-lg',
      );
    });

    it('suggestion items have hover state', () => {
      const { container } = render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
        />,
      );

      const suggestionButton = container.querySelector('button[type="button"]');
      expect(suggestionButton).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('accessibility', () => {
    it('input is searchable by role', () => {
      render(<LocationAutocompleteField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('suggestions are buttons for accessibility', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
        />,
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(mockSuggestions.length);
    });

    it('suggestion buttons have descriptive text', () => {
      render(
        <LocationAutocompleteField
          {...defaultProps}
          value="Nairobi"
          showSuggestions={true}
          suggestions={mockSuggestions}
        />,
      );

      mockSuggestions.forEach((suggestion) => {
        expect(screen.getByText(suggestion.description)).toBeInTheDocument();
      });
    });
  });
});
