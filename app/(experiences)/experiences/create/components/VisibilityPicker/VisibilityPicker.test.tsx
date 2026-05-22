import { render, screen } from '@testing-library/react';

import { VisibilityPicker } from './VisibilityPicker';

describe('VisibilityPicker', () => {
  it('renders visibility options', () => {
    render(<VisibilityPicker value="public" onChange={() => {}} />);
    expect(screen.getByText('Public (Everyone)')).toBeInTheDocument();
    expect(screen.getByText('Private (Only invited people)')).toBeInTheDocument();
  });

  it('renders with public visibility label', () => {
    render(<VisibilityPicker value="public" onChange={() => {}} />);
    expect(screen.getByText(/Experience visibility/i)).toBeInTheDocument();
  });
});
