import { render, screen } from '@testing-library/react';
import { DescriptionFields } from './DescriptionFields';

jest.mock('@/components/blocks/editor-00/editor', () => ({
  Editor: ({ editorSerializedState, onSerializedChange }: any) => (
    <div data-testid="editor" onClick={() => onSerializedChange(editorSerializedState)} />
  ),
}));

describe('DescriptionFields', () => {
  const defaultProps = {
    description: '',
    whatsIncluded: '',
    whatsNotIncluded: '',
    onDescriptionChange: jest.fn(),
    onWhatsIncludedChange: jest.fn(),
    onWhatsNotIncludedChange: jest.fn(),
  };

  it('renders all three editor fields with labels', () => {
    render(<DescriptionFields {...defaultProps} />);
    expect(screen.getByText('Add your experience description')).toBeInTheDocument();
    expect(screen.getByText("What's included")).toBeInTheDocument();
    expect(screen.getByText("What's NOT included")).toBeInTheDocument();
  });

  it('renders three editor instances', () => {
    render(<DescriptionFields {...defaultProps} />);
    const editors = screen.getAllByTestId('editor');
    expect(editors).toHaveLength(3);
  });

  it('displays error message for description', () => {
    render(<DescriptionFields {...defaultProps} descriptionError="Description is required" />);
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });
});
