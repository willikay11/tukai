import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText(/Add your experience description/i)).toBeInTheDocument();
    expect(screen.getByText(/Where will the experience take place/i)).toBeInTheDocument();
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
