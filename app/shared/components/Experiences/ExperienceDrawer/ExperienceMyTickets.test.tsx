import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceMyTickets } from './ExperienceMyTickets';

const useSession = jest.fn();
jest.mock('next-auth/react', () => ({ useSession: () => useSession() }));

const useExperienceTicketPurchases = jest.fn();
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperienceTicketPurchases: (id: string, enabled: boolean) =>
    useExperienceTicketPurchases(id, enabled),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const downloadTicketPdf = jest.fn();
jest.mock('@/services/experience', () => ({
  downloadTicketPdf: (purchaseId: string) => downloadTicketPdf(purchaseId),
}));

jest.mock('@/app/shared/components/Share', () => ({
  Share: () => <button type="button">share</button>,
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const experience = {
  id: 'e1',
  title: 'Pottery for beginners',
  photos: [],
} as unknown as Experience;

const purchase = (id: string, status: string, ticketName: string, qrCodeImage: string | null) => ({
  id,
  ticketNumber: `TKT-${id}`,
  ticket: { id: `ticket-${ticketName}`, name: ticketName, price: '1500.00', currency: 'KES', experience: 'e1' },
  occurrence: { id: 'occ-a', startDate: '2026-08-27T14:00:00Z', endDate: '2026-08-27T17:00:00Z' },
  qrCodeImage,
  ticketPdf: qrCodeImage ? 'https://x/pdf' : null,
  status,
  dateCreated: '2026-07-14T20:04:50Z',
});

describe('ExperienceMyTickets', () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useSession.mockReturnValue({ data: { user: { id: 'u1' } } });
  });

  it('renders nothing for a signed-out reader', () => {
    useSession.mockReturnValue({ data: null });
    useExperienceTicketPurchases.mockReturnValue({ data: undefined });

    const { container } = render(<ExperienceMyTickets experience={experience} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the reader has no usable purchase for this experience', () => {
    useExperienceTicketPurchases.mockReturnValue({
      data: { data: { results: [purchase('p1', 'expired', 'Adults', null)] } },
    });

    const { container } = render(<ExperienceMyTickets experience={experience} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the first ticket type, its quantity and the Paid in full status', () => {
    useExperienceTicketPurchases.mockReturnValue({
      data: {
        data: {
          results: [
            purchase('p1', 'completed', 'Adults', 'https://x/qr1'),
            purchase('p2', 'completed', 'Adults', 'https://x/qr2'),
            purchase('p3', 'paid', 'Kids', 'https://x/qr3'),
          ],
        },
      },
    });

    render(<ExperienceMyTickets experience={experience} />);

    expect(screen.getByRole('heading', { name: 'My tickets' })).toBeInTheDocument();
    expect(screen.getByText('Adults')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('Kids')).not.toBeInTheDocument();
    expect(screen.getByText('Paid in full')).toBeInTheDocument();
  });

  // One card at a time, paged from the Paid in full row - not every ticket
  // type stacked at once
  it('pages between ticket types with the navigation beside Paid in full', () => {
    useExperienceTicketPurchases.mockReturnValue({
      data: {
        data: {
          results: [
            purchase('p1', 'completed', 'Adults', 'https://x/qr1'),
            purchase('p2', 'paid', 'Kids', 'https://x/qr2'),
          ],
        },
      },
    });

    render(<ExperienceMyTickets experience={experience} />);

    expect(screen.getByText('Adults')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous ticket' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next ticket' }));

    expect(screen.queryByText('Adults')).not.toBeInTheDocument();
    expect(screen.getByText('Kids')).toBeInTheDocument();
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next ticket' })).toBeDisabled();
  });

  it('leaves out the ticket-paging navigation with only one ticket type', () => {
    useExperienceTicketPurchases.mockReturnValue({
      data: { data: { results: [purchase('p1', 'completed', 'Adults', 'https://x/qr1')] } },
    });

    render(<ExperienceMyTickets experience={experience} />);

    expect(screen.queryByRole('button', { name: 'Next ticket' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous ticket' })).not.toBeInTheDocument();
  });

  it('collapses behind its own chevron toggle', () => {
    useExperienceTicketPurchases.mockReturnValue({
      data: { data: { results: [purchase('p1', 'completed', 'Adults', 'https://x/qr1')] } },
    });

    render(<ExperienceMyTickets experience={experience} />);

    const toggle = screen.getByRole('button', { name: 'My tickets' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Paid in full')).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Paid in full')).not.toBeInTheDocument();
  });

  it('downloads every ticket in a type, one file at a time', async () => {
    downloadTicketPdf.mockResolvedValue(new Blob(['pdf']));
    useExperienceTicketPurchases.mockReturnValue({
      data: {
        data: {
          results: [
            purchase('p1', 'completed', 'Adults', 'https://x/qr1'),
            purchase('p2', 'completed', 'Adults', 'https://x/qr2'),
          ],
        },
      },
    });

    render(<ExperienceMyTickets experience={experience} />);

    fireEvent.click(screen.getByRole('button', { name: /download/i }));

    await waitFor(() => expect(downloadTicketPdf).toHaveBeenCalledTimes(2));
    expect(downloadTicketPdf).toHaveBeenCalledWith('p1');
    expect(downloadTicketPdf).toHaveBeenCalledWith('p2');
  });

  it('toasts an error rather than throwing when a download fails', async () => {
    downloadTicketPdf.mockRejectedValue(new Error('network'));
    useExperienceTicketPurchases.mockReturnValue({
      data: { data: { results: [purchase('p1', 'completed', 'Adults', 'https://x/qr1')] } },
    });

    render(<ExperienceMyTickets experience={experience} />);

    fireEvent.click(screen.getByRole('button', { name: /download/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' }),
      ),
    );
  });
});
