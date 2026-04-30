import { render, screen } from '@testing-library/react';
import { PhotoUploader } from './PhotoUploader';

describe('PhotoUploader', () => {
  it('renders file upload field', () => {
    render(<PhotoUploader photoUrl={null} onPhotoChange={() => {}} />);
    expect(screen.getByText('Add Photo(s)')).toBeInTheDocument();
  });

  it('displays helper text about image dimensions', () => {
    render(<PhotoUploader photoUrl={null} onPhotoChange={() => {}} />);
    expect(screen.getByText(/540 x 540/i)).toBeInTheDocument();
  });

  it('displays error when provided', () => {
    render(<PhotoUploader photoUrl={null} onPhotoChange={() => {}} error="Photo is required" />);
    expect(screen.getByText('Photo is required')).toBeInTheDocument();
  });
});
