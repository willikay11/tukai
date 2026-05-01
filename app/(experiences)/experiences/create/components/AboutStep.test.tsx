import { render, screen } from '@testing-library/react';

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
    data: { data: { results: [] } },
    isLoading: false,
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

describe('AboutStep', () => {
  const defaultFormData = {
    photo: null,
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
    render(<AboutStep {...defaultProps} />);
    expect(screen.getByText('Experience Title')).toBeInTheDocument();
    expect(screen.getByText(/Experience visibility/i)).toBeInTheDocument();
  });

  it('displays error messages', () => {
    const errors = {
      title: 'Title is required',
      description: 'Description is required',
    };
    render(<AboutStep {...defaultProps} errors={errors} />);
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });
});
