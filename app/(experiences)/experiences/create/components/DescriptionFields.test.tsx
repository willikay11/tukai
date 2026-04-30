import { render, screen, fireEvent } from '@testing-library/react';
import { DescriptionFields } from './DescriptionFields';

describe('DescriptionFields', () => {
  const defaultProps = {
    description: '',
    whatsIncluded: '',
    whatsNotIncluded: '',
    onDescriptionChange: jest.fn(),
    onWhatsIncludedChange: jest.fn(),
    onWhatsNotIncludedChange: jest.fn(),
  };

  it('renders all three textarea fields', () => {
    render(<DescriptionFields {...defaultProps} />);
    expect(screen.getByPlaceholderText(/grab people's attention/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add what is included/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add what is NOT included/i)).toBeInTheDocument();
  });

  it('displays current values in textareas', () => {
    render(
      <DescriptionFields
        {...defaultProps}
        description="Test description"
        whatsIncluded="Lunch included"
        whatsNotIncluded="Drinks not included"
      />
    );
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lunch included')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Drinks not included')).toBeInTheDocument();
  });

  it('calls callbacks when values change', () => {
    const onDescriptionChange = jest.fn();
    const onWhatsIncludedChange = jest.fn();
    const onWhatsNotIncludedChange = jest.fn();

    render(
      <DescriptionFields
        {...defaultProps}
        onDescriptionChange={onDescriptionChange}
        onWhatsIncludedChange={onWhatsIncludedChange}
        onWhatsNotIncludedChange={onWhatsNotIncludedChange}
      />
    );

    const descriptionTextarea = screen.getByPlaceholderText(/grab people's attention/i);
    fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });
    expect(onDescriptionChange).toHaveBeenCalledWith('New description');
  });

  it('displays error message for description', () => {
    render(<DescriptionFields {...defaultProps} descriptionError="Description is required" />);
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });
});
