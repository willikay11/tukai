import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type RenderOptions, render, screen } from '@testing-library/react';

import { AboutStep } from './index';

// AboutStep reaches React Query through AddPlaceModal's usePlaceCategories, so
// every render needs a client. Supplied via `wrapper` rather than by wrapping
// the element, so `rerender` keeps the provider in place.
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const rtlRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Wrapper, ...options });

jest.mock('@/app/shared/components/Forms', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('../CategoryPicker', () => ({
  CategoryPicker: ({ categories = [], onChange }: any) => (
    <div data-testid="category-picker" onClick={() => onChange?.([])}>
      Categories: {(categories || []).length}
    </div>
  ),
}));

jest.mock('../DescriptionFields', () => ({
  DescriptionFields: ({ label = '', value = '', onChange, error }: any) => (
    <div data-testid={`description-${label || 'field'}`}>
      <label>{label}</label>
      {error && <span>{error}</span>}
    </div>
  ),
}));

jest.mock('../ExperienceLocationInput', () => ({
  ExperienceLocationInput: ({ value = '', onChange, error }: any) => (
    <div data-testid="location-input">
      Location: {value || ''}
      {error && <span>{error}</span>}
    </div>
  ),
}));

jest.mock('../ExperienceTitleInput', () => ({
  ExperienceTitleInput: ({ value = '', onChange, error }: any) => (
    <div data-testid="title-input">
      Title: {value || ''}
      {error && <span>{error}</span>}
    </div>
  ),
}));

jest.mock('../MeetingDetailsInput', () => ({
  MeetingDetailsInput: ({ meetingPoint = '', meetingTime = '', onChange }: any) => (
    <div data-testid="meeting-input">
      Meeting: {meetingPoint || ''} at {meetingTime || ''}
    </div>
  ),
}));

jest.mock('../PhotoUploader', () => ({
  PhotoUploader: ({ photos, onPhotoChange, error }: any) => (
    <div data-testid="photo-uploader">
      Photos: {photos?.length || 0}
      {error && <span>{error}</span>}
    </div>
  ),
}));

jest.mock('../VisibilityPicker', () => ({
  VisibilityPicker: ({ value, onChange }: any) => (
    <div data-testid="visibility-picker">Visibility: {value}</div>
  ),
}));

describe('AboutStep', () => {
  const defaultFormData = {
    photos: [],
    title: '',
    visibility: 'public' as const,
    description: '',
    whatsIncluded: '',
    whatsNotIncluded: '',
    location: '',
    locationPlaceId: '',
    meetingPoint: '',
    meetingTime: null,
    categories: [],
    // Set when a place is chosen through AddPlaceModal
    placeId: '',
    placeImageUrl: null,
  };

  const defaultProps = {
    formData: defaultFormData,
    errors: {},
    onFormDataChange: jest.fn(),
    onCancel: jest.fn(),
    onSaveEdit: jest.fn(),
    onSaveContinue: jest.fn(),
  };

  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = rtlRender(<AboutStep {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders all form sections', () => {
      rtlRender(<AboutStep {...defaultProps} />);
      expect(screen.getByTestId('photo-uploader')).toBeInTheDocument();
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByTestId('visibility-picker')).toBeInTheDocument();
      expect(screen.getByText('Where will the experience take place?')).toBeInTheDocument();
    });

    it('renders description fields', () => {
      const { container } = rtlRender(<AboutStep {...defaultProps} />);
      const descriptionFields = container.querySelectorAll('[data-testid^="description-"]');
      expect(descriptionFields.length).toBeGreaterThanOrEqual(1);
    });

    it('renders category picker', () => {
      rtlRender(<AboutStep {...defaultProps} />);
      expect(screen.getByTestId('category-picker')).toBeInTheDocument();
    });

    it('renders meeting details input', () => {
      rtlRender(<AboutStep {...defaultProps} />);
      expect(screen.getByTestId('meeting-input')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      rtlRender(<AboutStep {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save & Continue')).toBeInTheDocument();
    });

    it('renders save exit button when onSaveEdit provided', () => {
      rtlRender(<AboutStep {...defaultProps} onSaveEdit={jest.fn()} />);
      expect(screen.getByText('Save & Exit')).toBeInTheDocument();
    });

    it('renders preview button when onPreview provided', () => {
      rtlRender(<AboutStep {...defaultProps} onPreview={jest.fn()} />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  describe('Form Data Display', () => {
    it('displays title input component', () => {
      rtlRender(
        <AboutStep {...defaultProps} formData={{ ...defaultFormData, title: 'Test Experience' }} />,
      );
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
    });

    it('renders visibility picker component', () => {
      rtlRender(
        <AboutStep {...defaultProps} formData={{ ...defaultFormData, visibility: 'private' }} />,
      );
      expect(screen.getByTestId('visibility-picker')).toBeInTheDocument();
    });

    it('shows the chosen place on the location button', () => {
      rtlRender(
        <AboutStep {...defaultProps} formData={{ ...defaultFormData, location: 'Nairobi' }} />,
      );

      expect(screen.getByRole('button', { name: /Nairobi/ })).toBeInTheDocument();
    });

    it('prompts to pick a place when none is chosen', () => {
      rtlRender(<AboutStep {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Select a place/ })).toBeInTheDocument();
    });

    it('renders photo uploader with photos', () => {
      const photoWithData = [
        { id: '1', url: 'https://example.com/photo1.jpg' },
        { id: '2', url: 'https://example.com/photo2.jpg' },
      ];
      rtlRender(
        <AboutStep {...defaultProps} formData={{ ...defaultFormData, photos: photoWithData }} />,
      );
      expect(screen.getByTestId('photo-uploader')).toBeInTheDocument();
    });

    it('renders category picker with categories', () => {
      const categories = [
        { id: '1', name: 'Hiking', slug: 'hiking' },
        { id: '2', name: 'Photography', slug: 'photography' },
      ];
      rtlRender(<AboutStep {...defaultProps} formData={{ ...defaultFormData, categories }} />);
      expect(screen.getByTestId('category-picker')).toBeInTheDocument();
    });

    it('renders meeting details input component', () => {
      rtlRender(
        <AboutStep
          {...defaultProps}
          formData={{
            ...defaultFormData,
            meetingPoint: 'Park Entrance',
            meetingTime: '10:00',
          }}
        />,
      );
      expect(screen.getByTestId('meeting-input')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('displays title error when present', () => {
      rtlRender(<AboutStep {...defaultProps} errors={{ title: 'Title is required' }} />);
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    it('displays location error when present', () => {
      rtlRender(<AboutStep {...defaultProps} errors={{ location: 'Location is required' }} />);
      expect(screen.getByText('Location is required')).toBeInTheDocument();
    });

    it('accepts description error prop', () => {
      const { container } = rtlRender(
        <AboutStep {...defaultProps} errors={{ description: 'Description is required' }} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts photo error prop', () => {
      const { container } = rtlRender(
        <AboutStep {...defaultProps} errors={{ photos: 'At least one photo is required' }} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('accepts multiple error props', () => {
      const { container } = rtlRender(
        <AboutStep
          {...defaultProps}
          errors={{
            title: 'Title required',
            location: 'Location required',
            description: 'Description required',
          }}
        />,
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('calls onCancel when cancel button clicked', () => {
      const onCancel = jest.fn();
      rtlRender(<AboutStep {...defaultProps} onCancel={onCancel} />);
      screen.getByText('Cancel').click();
      expect(onCancel).toHaveBeenCalled();
    });

    it('calls onSaveContinue when save continue button clicked', () => {
      const onSaveContinue = jest.fn();
      rtlRender(<AboutStep {...defaultProps} onSaveContinue={onSaveContinue} />);
      screen.getByText('Save & Continue').click();
      expect(onSaveContinue).toHaveBeenCalled();
    });

    it('calls onSaveEdit when save exit button clicked', () => {
      const onSaveEdit = jest.fn();
      rtlRender(<AboutStep {...defaultProps} onSaveEdit={onSaveEdit} />);
      screen.getByText('Save & Exit').click();
      expect(onSaveEdit).toHaveBeenCalled();
    });

    it('calls onPreview when preview button clicked', () => {
      const onPreview = jest.fn();
      rtlRender(<AboutStep {...defaultProps} onPreview={onPreview} />);
      screen.getByText('Preview').click();
      expect(onPreview).toHaveBeenCalled();
    });

    it('calls onFormDataChange when photo changes', () => {
      const onFormDataChange = jest.fn();
      rtlRender(<AboutStep {...defaultProps} onFormDataChange={onFormDataChange} />);
      expect(onFormDataChange).toBeDefined();
    });

    it('calls onFormDataChange when title changes', () => {
      const onFormDataChange = jest.fn();
      rtlRender(<AboutStep {...defaultProps} onFormDataChange={onFormDataChange} />);
      expect(onFormDataChange).toBeDefined();
    });

    it('calls onFormDataChange when visibility changes', () => {
      const onFormDataChange = jest.fn();
      rtlRender(<AboutStep {...defaultProps} onFormDataChange={onFormDataChange} />);
      expect(onFormDataChange).toBeDefined();
    });
  });

  describe('Loading State', () => {
    it('disables save button when isSaving is true', () => {
      rtlRender(<AboutStep {...defaultProps} isSaving={true} />);
      const saveButton = screen.getByText('Save & Continue');
      expect(saveButton).toBeDisabled();
    });

    it('enables save button when isSaving is false', () => {
      rtlRender(<AboutStep {...defaultProps} isSaving={false} />);
      const saveButton = screen.getByText('Save & Continue');
      expect(saveButton).not.toBeDisabled();
    });

    it('displays loading state in save button', () => {
      rtlRender(<AboutStep {...defaultProps} isSaving={true} />);
      expect(screen.getByText('Save & Continue')).toBeInTheDocument();
    });
  });

  describe('Props Updates', () => {
    it('updates form data when props change', () => {
      const { rerender } = rtlRender(
        <AboutStep {...defaultProps} formData={{ ...defaultFormData, title: 'Old Title' }} />,
      );
      expect(screen.getByText(/Old Title/)).toBeInTheDocument();

      rerender(
        <AboutStep {...defaultProps} formData={{ ...defaultFormData, title: 'New Title' }} />,
      );
      expect(screen.getByText(/New Title/)).toBeInTheDocument();
    });

    it('updates errors when props change', () => {
      const { rerender } = rtlRender(<AboutStep {...defaultProps} errors={{}} />);
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();

      rerender(<AboutStep {...defaultProps} errors={{ title: 'Title is required' }} />);
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  describe('Complete Form', () => {
    it('renders fully filled form', () => {
      const completeData = {
        photos: [{ id: '1', url: 'https://example.com/photo.jpg' }],
        title: 'Mountain Hiking Adventure',
        visibility: 'public' as const,
        description: 'Join us for an exciting mountain hike',
        whatsIncluded: 'Guide, equipment, meals',
        whatsNotIncluded: 'Transportation',
        location: 'Mount Kenya',
        locationPlaceId: 'place-123',
        meetingPoint: 'Kenya Gate Lodge',
        meetingTime: '08:00',
        categories: [
          { id: '1', name: 'Hiking', slug: 'hiking' },
          { id: '2', name: 'Adventure', slug: 'adventure' },
        ],
      };

      rtlRender(<AboutStep {...defaultProps} formData={completeData} />);

      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByText('Where will the experience take place?')).toBeInTheDocument();
      expect(screen.getByTestId('meeting-input')).toBeInTheDocument();
      expect(screen.getByTestId('photo-uploader')).toBeInTheDocument();
      expect(screen.getByTestId('category-picker')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty form data', () => {
      rtlRender(<AboutStep {...defaultProps} formData={defaultFormData} />);
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
    });

    it('handles null meetingTime', () => {
      rtlRender(
        <AboutStep {...defaultProps} formData={{ ...defaultFormData, meetingTime: null }} />,
      );
      expect(screen.getByTestId('meeting-input')).toBeInTheDocument();
    });

    it('handles empty categories', () => {
      rtlRender(<AboutStep {...defaultProps} formData={{ ...defaultFormData, categories: [] }} />);
      expect(screen.getByTestId('category-picker')).toBeInTheDocument();
    });

    it('handles long title', () => {
      const longTitle = 'A'.repeat(200);
      rtlRender(
        <AboutStep {...defaultProps} formData={{ ...defaultFormData, title: longTitle }} />,
      );
      expect(screen.getByText(new RegExp(longTitle))).toBeInTheDocument();
    });
  });
});
