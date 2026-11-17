import React from 'react';

import { render } from '@testing-library/react';

import { ScrollRow } from './ScrollRow';

const withRailWidth = (width: number) =>
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);

describe('ScrollRow', () => {
  afterEach(() => jest.restoreAllMocks());

  const cardWidth = (row: Element | null) =>
    (row as HTMLElement).style.getPropertyValue('--rail-card-w');

  // The handoff's phones: 312, 342 and 382px of content, two cards each
  it.each([
    [312, '146px'],
    [342, '161px'],
    [382, '181px'],
  ])('fits two whole cards in a %ipx rail', (width, expected) => {
    withRailWidth(width);

    const { container } = render(<ScrollRow>cards</ScrollRow>);

    expect(cardWidth(container.firstElementChild)).toBe(expected);
  });

  it('fits as many 168px cards as a wide rail holds', () => {
    // floor((1308 + 16) / 184) = 7 columns
    withRailWidth(1312);

    const { container } = render(<ScrollRow>cards</ScrollRow>);

    expect(cardWidth(container.firstElementChild)).toBe('173.14px');
  });

  it('still hands its own ref on', () => {
    withRailWidth(400);
    const ref = React.createRef<HTMLDivElement>();

    const { container } = render(<ScrollRow ref={ref}>cards</ScrollRow>);

    expect(ref.current).toBe(container.firstElementChild);
  });
});
