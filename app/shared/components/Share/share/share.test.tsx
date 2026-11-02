import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { toast } from '@/app/shared/hooks/useToast';

import type { ShareContent } from '../shareContent';
import { Share } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { fill, quality, ...imgProps } = props;
    return <img {...imgProps} />;
  },
}));

jest.mock('@/app/shared/hooks/useToast', () => ({ toast: jest.fn() }));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const content: ShareContent = {
  heading: 'Share place',
  kind: 'Place',
  kindIcon: 'Location01Icon',
  image: 'https://example.com/photo.jpg',
  title: 'The Roastery',
  sub: 'Cafe · Westlands',
  url: 'https://tukai.co/p/p5',
  lead: 'The Roastery on Tukai',
  isPrivate: false,
  note: 'Anyone with the link can see The Roastery, its hours and what is on there.',
};

const openSheet = (props: Partial<ShareContent> = {}) => {
  render(<Share content={{ ...content, ...props }} variant="icon" />);
  fireEvent.click(screen.getByRole('button', { name: 'Share' }));
  return screen.getByRole('dialog');
};

describe('Share', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    // No device menu by default; most desktop browsers have none
    Object.assign(navigator, { share: undefined });
  });

  it('names the dialog for what is being shared', () => {
    expect(openSheet()).toHaveAccessibleName('Share place');
  });

  it('previews the thing, its kind, and the link without https://', () => {
    const dialog = openSheet();

    expect(within(dialog).getByRole('heading', { name: 'The Roastery' })).toBeInTheDocument();
    expect(within(dialog).getByText('Cafe · Westlands')).toBeInTheDocument();
    expect(within(dialog).getByText('Place')).toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: 'Link' })).toHaveValue('tukai.co/p/p5');
  });

  it('starts on Copy link', () => {
    openSheet();

    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveFocus();
  });

  it('copies the link, turns into Copied and toasts', async () => {
    openSheet();

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content.url);
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Link copied.' }));
  });

  it('is back to Copy link the next time it opens', async () => {
    openSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    await screen.findByRole('button', { name: 'Copied' });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));

    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
  });

  it('leaves the link selected where the clipboard is refused', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
    });
    openSheet();

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Link' })).toHaveFocus());
    expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument();
  });

  it('sends "{lead}: {link}" to WhatsApp and Email', () => {
    const dialog = openSheet();
    const message = 'The Roastery on Tukai: https://tukai.co/p/p5';

    const whatsapp = within(dialog).getByRole('link', { name: /WhatsApp/ });
    expect(whatsapp).toHaveAttribute('href', `https://wa.me/?text=${encodeURIComponent(message)}`);
    expect(whatsapp).toHaveAttribute('target', '_blank');
    expect(whatsapp).toHaveAccessibleName('WhatsApp, opens in a new tab');

    expect(within(dialog).getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      `mailto:?subject=${encodeURIComponent('The Roastery on Tukai')}&body=${encodeURIComponent(message)}`,
    );
  });

  it('says who the link works for', () => {
    const dialog = openSheet();

    expect(within(dialog).getByText(content.note)).toBeInTheDocument();
    expect(within(dialog).getByTestId('ViewIcon')).toBeInTheDocument();
  });

  it('shows the lock beside the note for something private', () => {
    const dialog = openSheet({ isPrivate: true, note: 'Only members can open this link.' });

    expect(within(dialog).getByTestId('SquareLock02Icon')).toBeInTheDocument();
  });

  it('closes on Close', () => {
    openSheet();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape without the Escape reaching what sits underneath', () => {
    const underneath = jest.fn();
    document.addEventListener('keydown', underneath);
    openSheet();

    fireEvent.keyDown(screen.getByRole('button', { name: 'Copy link' }), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(underneath).not.toHaveBeenCalled();
    document.removeEventListener('keydown', underneath);
  });

  it('hides More where the browser has no share menu', () => {
    const dialog = openSheet();

    expect(within(dialog).queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
  });

  describe('on a device with a share menu', () => {
    it('offers More, and hands it the title, the lead and the link', async () => {
      const share = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { share });
      openSheet();

      fireEvent.click(await screen.findByRole('button', { name: 'More' }));

      await waitFor(() =>
        expect(share).toHaveBeenCalledWith({
          title: 'The Roastery',
          text: 'The Roastery on Tukai',
          url: content.url,
        }),
      );
    });

    // Dismissing the device's menu rejects; that is not a failure worth reporting
    it('stays open when the menu is dismissed', async () => {
      Object.assign(navigator, { share: jest.fn().mockRejectedValue(new Error('AbortError')) });
      openSheet();

      fireEvent.click(await screen.findByRole('button', { name: 'More' }));

      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    });
  });
});
