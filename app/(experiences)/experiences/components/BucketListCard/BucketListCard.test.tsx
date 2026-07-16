import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketList } from '@/types/bucket-list';

import { SharedBucketListCard } from '../SharedBucketListCard';
import { BucketListCard } from './index';

const mockJoin = jest.fn();
jest.mock('@/app/shared/hooks/useBucketLists', () => ({
  useJoinBucketList: () => ({ mutate: mockJoin, isPending: false }),
}));

const bucketList: BucketList = {
  id: 'bucket-1',
  title: 'Weekend Hikes',
  isPublic: true,
  coverPhoto: '/images/kilimanjaro.webp',
  savedCount: 12,
  previewPhotos: ['/images/one.jpg', '/images/two.jpg', '/images/three.jpg', '/images/four.jpg'],
  members: [
    { id: 'm1', name: 'Tony Ouma', picture: null },
    { id: 'm2', name: 'Wanjiku Kamau', picture: null },
    { id: 'm3', name: 'Brian Otieno', picture: null },
    { id: 'm4', name: 'Achieng Odhiambo', picture: null },
  ],
  owner: { id: 'me', name: 'You' },
  isOwner: true,
  hasJoined: true,
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('BucketListCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders title, visibility badge, saved count and thumbnail overflow', () => {
    render(<BucketListCard bucketList={bucketList} onClick={jest.fn()} />);

    expect(screen.getByText('Weekend Hikes')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('12 saved')).toBeInTheDocument();
    // 12 saved with 4 thumbnails shown → "+8" overflow
    expect(screen.getByText('+8')).toBeInTheDocument();
  });

  it('shows Private badge and member avatar overflow', () => {
    render(<BucketListCard bucketList={{ ...bucketList, isPublic: false }} onClick={jest.fn()} />);

    expect(screen.getByText('Private')).toBeInTheDocument();
    // 4 members with max 3 avatars → "+1" facepile overflow
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('fires onClick when the card is clicked', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<BucketListCard bucketList={bucketList} onClick={onClick} />);

    await user.click(screen.getByText('Weekend Hikes'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('SharedBucketListCard', () => {
  beforeEach(() => jest.clearAllMocks());

  const shared: BucketList = {
    ...bucketList,
    id: 'bucket-shared-1',
    owner: { id: 'm1', name: 'Tony Ouma' },
    isOwner: false,
    hasJoined: false,
    savedCount: 8,
  };

  it('renders owner attribution and a Join button that fires the mutation', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedBucketListCard bucketList={shared} />);

    expect(screen.getByText('By Tony Ouma · 8 saved')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Join' }));
    expect(mockJoin).toHaveBeenCalledWith('bucket-shared-1');
  });

  it('shows a disabled Joined button when already joined', () => {
    renderWithQueryClient(<SharedBucketListCard bucketList={{ ...shared, hasJoined: true }} />);

    const button = screen.getByRole('button', { name: 'Joined' });
    expect(button).toBeDisabled();
  });
});
