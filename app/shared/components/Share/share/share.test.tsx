import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { Share } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { fill, quality, ...imgProps } = props;
    return <img {...imgProps} />;
  },
}));

const props = {
  coverPhoto: 'https://example.com/photo.jpg',
  title: 'Test Title',
  link: 'https://example.com/thing',
};

const openDialog = () => {
  fireEvent.click(screen.getByTestId('Share08Icon'));
  return screen.getByRole('dialog');
};

describe('Share', () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    // No device sheet by default; the grid is what most desktops get
    Object.assign(navigator, { share: undefined });
  });

  it('renders the share control', () => {
    render(<Share {...props} />);

    expect(screen.getByTestId('Share08Icon')).toBeInTheDocument();
  });

  /**
   * It said "Share Location" over an experience, a community and a bucket list
   * alike. The heading names what is actually being sent.
   */
  it.each([
    ['place', 'Share this place'],
    ['experience', 'Share this experience'],
    ['community', 'Share this community'],
    ['bucket list', 'Share this bucket list'],
  ] as const)('names a %s in the heading', (kind, heading) => {
    render(<Share {...props} kind={kind} />);

    expect(within(openDialog()).getByText(heading)).toBeInTheDocument();
  });

  it('defaults to a place where the caller says nothing', () => {
    render(<Share {...props} />);

    expect(within(openDialog()).getByText('Share this place')).toBeInTheDocument();
  });

  it('shows what is about to be sent, and where it points', () => {
    render(<Share {...props} kind="experience" />);
    const dialog = openDialog();

    expect(within(dialog).getByText('Test Title')).toBeInTheDocument();
    expect(within(dialog).getByText('https://example.com/thing')).toBeInTheDocument();
  });

  it('copies the link and says it did', async () => {
    render(<Share {...props} />);
    openDialog();

    fireEvent.click(screen.getByText('Copy link'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(props.link);
    expect(await screen.findByText('Link copied')).toBeInTheDocument();
  });

  // Each destination is a real link, so it opens where the reader expects
  it('points every destination at the thing being shared', () => {
    render(<Share {...props} kind="experience" />);
    const dialog = openDialog();

    const hrefFor = (name: string) =>
      within(dialog).getByRole('link', { name }).getAttribute('href') ?? '';

    expect(decodeURIComponent(hrefFor('WhatsApp'))).toContain(props.link);
    expect(decodeURIComponent(hrefFor('Telegram'))).toContain(props.link);
    expect(decodeURIComponent(hrefFor('X'))).toContain(props.link);
    expect(decodeURIComponent(hrefFor('Facebook'))).toContain(props.link);
    expect(decodeURIComponent(hrefFor('Email'))).toContain(props.link);
  });

  it('names the kind in the message that goes out', () => {
    render(<Share {...props} kind="community" />);
    const dialog = openDialog();

    const whatsapp = within(dialog).getByRole('link', { name: 'WhatsApp' });
    expect(decodeURIComponent(whatsapp.getAttribute('href') ?? '')).toContain(
      'this community on Tukai',
    );
  });

  describe('on a device with a share sheet of its own', () => {
    it('offers it, and hands it the link', async () => {
      const share = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { share });

      render(<Share {...props} kind="place" />);
      openDialog();

      const button = await screen.findByRole('button', { name: /Share via/ });
      fireEvent.click(button);

      await waitFor(() =>
        expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: props.link })),
      );
    });

    // Dismissing the OS sheet rejects; that is not a failure worth reporting
    it('stays put when the sheet is dismissed', async () => {
      Object.assign(navigator, { share: jest.fn().mockRejectedValue(new Error('AbortError')) });

      render(<Share {...props} />);
      openDialog();

      fireEvent.click(await screen.findByRole('button', { name: /Share via/ }));

      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    });
  });
});
