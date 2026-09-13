import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { MomentRowCard } from './index';

jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const makeMoment = (overrides: Partial<Moment> = {}): Moment =>
  ({
    id: 'm1',
    title: 'Sunset at Diani',
    description: '',
    author: {
      id: 'u1',
      firstName: 'Asha',
      lastName: 'Mwangi',
      displayName: null,
      picture: 'https://cdn.tukai.co/avatar.jpg',
      isFollowing: false,
    },
    community: null,
    experience: null,
    place: null,
    media: [
      {
        id: 'md1',
        mediaType: 'photo',
        photo: 'https://cdn.tukai.co/photo.jpg',
        width: 1,
        height: 1,
        order: 0,
      },
    ],
    totalLikes: 0,
    totalComments: 0,
    dateCreated: '',
    ...overrides,
  }) as Moment;

describe('MomentRowCard', () => {
  it('renders the first media photo and the author chip', () => {
    render(<MomentRowCard moment={makeMoment()} onClick={jest.fn()} />);

    expect(screen.getByAltText('Sunset at Diani')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/photo.jpg',
    );
    expect(screen.getByText('Asha Mwangi')).toBeInTheDocument();
  });

  it('prefers displayName over first + last name', () => {
    const moment = makeMoment();
    moment.author.displayName = 'ashaeats';
    render(<MomentRowCard moment={moment} onClick={jest.fn()} />);

    expect(screen.getByText('ashaeats')).toBeInTheDocument();
    expect(screen.queryByText('Asha Mwangi')).not.toBeInTheDocument();
  });

  it('falls back to first + last when displayName is blank', () => {
    const moment = makeMoment();
    moment.author.displayName = '   ';
    render(<MomentRowCard moment={moment} onClick={jest.fn()} />);

    expect(screen.getByText('Asha Mwangi')).toBeInTheDocument();
  });

  it('uses the first media item when several are present', () => {
    const moment = makeMoment({
      media: [
        {
          id: 'a',
          mediaType: 'photo',
          photo: 'https://cdn.tukai.co/first.jpg',
          width: 1,
          height: 1,
          order: 0,
        },
        {
          id: 'b',
          mediaType: 'photo',
          photo: 'https://cdn.tukai.co/second.jpg',
          width: 1,
          height: 1,
          order: 1,
        },
      ],
    });
    render(<MomentRowCard moment={moment} onClick={jest.fn()} />);

    expect(screen.getByAltText('Sunset at Diani')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/first.jpg',
    );
  });

  it('shows the author initial when there is no avatar', () => {
    const moment = makeMoment();
    moment.author.picture = null;
    render(<MomentRowCard moment={moment} onClick={jest.fn()} />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('fires onClick when the card is pressed', () => {
    const onClick = jest.fn();
    render(<MomentRowCard moment={makeMoment()} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
