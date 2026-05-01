import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('lucide-react', () => ({
  __esModule: true,
  default: () => <div />,
  X: () => <div />,
}));

jest.mock('@/components/blocks/editor-00/editor', () => ({
  Editor: ({ editorSerializedState, onSerializedChange }: any) => (
    <div data-testid="editor" onClick={() => onSerializedChange(editorSerializedState)} />
  ),
}));

jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: jest.fn(() => ({
    data: {
      data: {
        results: [
          { id: '1', name: 'Hiking' },
          { id: '2', name: 'Running' },
        ],
      },
    },
    isLoading: false,
  })),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useGoogleMapsAutocomplete: jest.fn(() => ({
    data: { data: [] },
    isFetching: false,
  })),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, ...props }: any) => (
    <input placeholder={placeholder} {...props} />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children }: any) => <div>{children}</div>,
  RadioGroupItem: ({ value, id }: any) => <input type="radio" value={value} id={id} />,
}));

jest.mock('./CategoryPicker', () => ({
  CategoryPicker: ({ selectedCategories, onChange }: any) => (
    <div data-testid="category-picker">
      Category Picker
    </div>
  ),
}));

jest.mock('@/components/ui/time-picker', () => ({
  TimePicker: ({ value, onChange, placeholder }: any) => (
    <input type="time" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  ),
}));

jest.mock('@/app/shared/components/LocationPicker', () => ({
  LocationAutocompleteField: ({ value, onChange }: any) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

jest.mock('@/app/shared/components/Forms', () => ({
  FileUploadField: ({ id, label }: any) => <div>{label}</div>,
}));

import { AboutStep } from './AboutStep';

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>,
  );
};

describe('AboutStep', () => {
  const defaultFormData = {
    photos: [],
    title: '',
    visibility: 'public' as const,
    description: '',
    whatsIncluded: '',
    whatsNotIncluded: '',
    location: '',
    meetingPoint: '',
    meetingTime: null,
    categories: [],
  };

  const defaultProps = {
    formData: defaultFormData,
    errors: {},
    onFormDataChange: jest.fn(),
    onCancel: jest.fn(),
    onSaveEdit: jest.fn(),
    onSaveContinue: jest.fn(),
  };

  it('renders all input sections', () => {
    renderWithQueryClient(<AboutStep {...defaultProps} />);
    expect(screen.getByText('Experience Title')).toBeInTheDocument();
    expect(screen.getByText(/Experience visibility/i)).toBeInTheDocument();
  });

  it('displays error messages', () => {
    const errors = {
      title: 'Title is required',
      description: 'Description is required',
    };
    renderWithQueryClient(<AboutStep {...defaultProps} errors={errors} />);
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });
});
