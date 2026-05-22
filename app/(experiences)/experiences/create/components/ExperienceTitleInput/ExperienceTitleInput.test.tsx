import { fireEvent, render, screen } from '@testing-library/react';

import { ExperienceTitleInput } from './ExperienceTitleInput';

describe('ExperienceTitleInput', () => {
  it('renders the label and input field', () => {
    render(<ExperienceTitleInput value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Experience Title')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<ExperienceTitleInput value="My Experience" onChange={() => {}} />);
    const input = screen.getByDisplayValue('My Experience');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when input changes', () => {
    const onChange = jest.fn();
    render(<ExperienceTitleInput value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText('Enter experience title');
    fireEvent.change(input, { target: { value: 'New Title' } });
    expect(onChange).toHaveBeenCalledWith('New Title');
  });

  it('displays error message when provided', () => {
    render(<ExperienceTitleInput value="" onChange={() => {}} error="Title is required" />);
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });
});
