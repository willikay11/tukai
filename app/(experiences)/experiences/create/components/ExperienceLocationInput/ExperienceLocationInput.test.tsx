import { render, screen } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';

import { ExperienceLocationInput } from './index';

jest.mock('@/app/shared/components/LocationPicker', () => ({
  LocationAutocompleteField: () => <div data-testid="location-field">location input</div>,
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useGoogleMapsAutocomplete: jest.fn(() => ({
    data: { data: [] },
    isFetching: false,
  })),
}));

describe('ExperienceLocationInput', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const onChange = jest.fn();
      const { container } = rtlRender(<ExperienceLocationInput value="" onChange={onChange} />);
      expect(container).toBeInTheDocument();
    });

    it('renders the label', () => {
      const onChange = jest.fn();
      rtlRender(<ExperienceLocationInput value="" onChange={onChange} />);
      expect(screen.getByText(/Where will the experience take place/i)).toBeInTheDocument();
    });

    it('renders the location input field', () => {
      const onChange = jest.fn();
      rtlRender(<ExperienceLocationInput value="" onChange={onChange} />);
      expect(screen.getByTestId('location-field')).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
      const onChange = jest.fn();
      rtlRender(
        <ExperienceLocationInput value="" onChange={onChange} error="Location is required" />,
      );
      expect(screen.getByText('Location is required')).toBeInTheDocument();
    });

    it('does not display error message when no error', () => {
      const onChange = jest.fn();
      rtlRender(<ExperienceLocationInput value="" onChange={onChange} />);
      expect(screen.queryByText('Location is required')).not.toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts value prop', () => {
      const onChange = jest.fn();
      const { rerender } = rtlRender(
        <ExperienceLocationInput value="Mount Kenya" onChange={onChange} />,
      );
      expect(screen.getByTestId('location-field')).toBeInTheDocument();

      rerender(<ExperienceLocationInput value="Nairobi" onChange={onChange} />);
      expect(screen.getByTestId('location-field')).toBeInTheDocument();
    });

    it('accepts placeId prop', () => {
      const onChange = jest.fn();
      const { container } = rtlRender(
        <ExperienceLocationInput value="Location" placeId="place-123" onChange={onChange} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('calls onChange when provided', () => {
      const onChange = jest.fn();
      rtlRender(<ExperienceLocationInput value="" onChange={onChange} />);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message', () => {
      const onChange = jest.fn();
      rtlRender(
        <ExperienceLocationInput
          value=""
          onChange={onChange}
          error="Please select a valid location"
        />,
      );
      expect(screen.getByText('Please select a valid location')).toBeInTheDocument();
    });

    it('updates error message when it changes', () => {
      const onChange = jest.fn();
      const { rerender } = rtlRender(
        <ExperienceLocationInput value="" onChange={onChange} error="Error 1" />,
      );

      expect(screen.getByText('Error 1')).toBeInTheDocument();

      rerender(<ExperienceLocationInput value="" onChange={onChange} error="Error 2" />);

      expect(screen.queryByText('Error 1')).not.toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
    });

    it('clears error when error prop is removed', () => {
      const onChange = jest.fn();
      const { rerender } = rtlRender(
        <ExperienceLocationInput value="" onChange={onChange} error="Error message" />,
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();

      rerender(<ExperienceLocationInput value="" onChange={onChange} />);

      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper label', () => {
      const onChange = jest.fn();
      rtlRender(<ExperienceLocationInput value="" onChange={onChange} />);
      const label = screen.getByText(/Where will the experience take place/i);
      expect(label).toBeInTheDocument();
    });
  });
});
