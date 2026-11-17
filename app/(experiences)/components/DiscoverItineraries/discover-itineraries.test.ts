import { railCardWidth, railStep } from './discover-itineraries';

describe('railCardWidth', () => {
  it('fills the rail with whole cards at 168px or wider', () => {
    // 1000 - 4 = 996; six columns of 168 with five gaps need 1088, five need 904
    expect(railCardWidth(1000)).toBe(186.4);
  });

  it('never drops below two columns', () => {
    // 300 - 4 = 296, shared by two with one gap
    expect(railCardWidth(300)).toBe(140);
  });

  it('rounds down to the hundredth so the last card never spills over', () => {
    const width = railCardWidth(1001)!;
    expect(width * 5 + 4 * 16).toBeLessThanOrEqual(997);
  });

  it('waits for a rail with a width', () => {
    expect(railCardWidth(0)).toBeNull();
  });
});

describe('railStep', () => {
  it('scrolls as many whole cards as fit', () => {
    // A card is 184 + 16 = 200; 1000px holds five
    expect(railStep(1000, 184)).toBe(1000);
    expect(railStep(1150, 184)).toBe(1000);
  });

  it('scrolls at least one card', () => {
    expect(railStep(150, 184)).toBe(200);
  });
});
