import { render, screen } from '@testing-library/react';

import { BucketListMember } from '@/types/bucket-list';

import { AvatarStack } from './index';

jest.mock('next/image', () => {
  function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const users: BucketListMember[] = Array.from({ length: 5 }, (_, index) => ({
  id: `u${index}`,
  name: `User ${index}`,
  picture: null,
}));

describe('AvatarStack', () => {
  // Regression: BucketListCard relies on the derived overflow
  it('derives the overflow from the users array by default', () => {
    render(<AvatarStack users={users} max={3} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('uses extraCount instead when the caller supplies a total', () => {
    render(<AvatarStack users={users.slice(0, 3)} max={3} extraCount={56} />);

    expect(screen.getByText('+56')).toBeInTheDocument();
  });

  it('renders nothing when there are no users', () => {
    const { container } = render(<AvatarStack users={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
