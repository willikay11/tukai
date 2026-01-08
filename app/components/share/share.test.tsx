import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';

import Share from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { fill, quality, ...imgProps } = props;
    return <img {...imgProps} />;
  },
}));

describe('Share Component', () => {
  const props = {
    coverPhoto: 'https://example.com/photo.jpg',
    title: 'Test Title',
    link: 'https://example.com',
  };

  it('should render the share icon', () => {
    render(<Share {...props} />);
    const shareIcon = screen.getByTestId('Share08Icon');
    expect(shareIcon).toBeInTheDocument();
  });

  it('should open the dialog when the share icon is clicked', () => {
    render(<Share {...props} />);
    const shareIcon = screen.getByTestId('Share08Icon');
    fireEvent.click(shareIcon);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Share Location')).toBeInTheDocument();
  });

  it('should copy the link to clipboard when "Copy Link" is clicked', () => {
    render(<Share {...props} />);
    const shareIcon = screen.getByTestId('Share08Icon');
    fireEvent.click(shareIcon);
    const copyLinkButton = screen.getByText(/Copy Link/i);
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    fireEvent.click(copyLinkButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(props.link);
  });
});
