import { getCommunities } from './community';
import { fetchExperiences } from './experience';
import { fetchPlaces } from './place';
import { searchPlaces } from './search';

jest.mock('./place', () => ({ fetchPlaces: jest.fn() }));
jest.mock('./experience', () => ({ fetchExperiences: jest.fn() }));
jest.mock('./community', () => ({ getCommunities: jest.fn() }));

const mockPlaces = fetchPlaces as jest.Mock;
const mockExperiences = fetchExperiences as jest.Mock;
const mockCommunities = getCommunities as jest.Mock;

const page = (count: number, results: unknown[]) => ({ data: { count, results } });

describe('searchPlaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlaces.mockResolvedValue(page(0, []));
    mockExperiences.mockResolvedValue(page(0, []));
    mockCommunities.mockResolvedValue(page(0, []));
  });

  it('passes the term to all three endpoints', async () => {
    await searchPlaces('karura');

    expect(mockPlaces).toHaveBeenCalledWith(1, 5, undefined, 'karura');
    expect(mockExperiences).toHaveBeenCalledWith(expect.objectContaining({ search: 'karura' }));
    expect(mockCommunities).toHaveBeenCalledWith(undefined, 1, 5, 'karura');
  });

  // ⚠️ Regression guard. The API treats `invited`'s PRESENCE as a filter, so
  // sending invited=false returned zero experiences for every query and the
  // group never appeared in the popover.
  it('never sends `invited` to the experiences endpoint', async () => {
    await searchPlaces('karura');

    expect(mockExperiences).toHaveBeenCalledTimes(1);
    expect(mockExperiences.mock.calls[0][0]).not.toHaveProperty('invited');
  });

  it('groups the results by type', async () => {
    mockExperiences.mockResolvedValue(page(2, [{ id: 'e1' }]));
    mockPlaces.mockResolvedValue(page(1, [{ id: 'p1' }]));
    mockCommunities.mockResolvedValue(page(3, [{ id: 'c1' }]));

    const result = await searchPlaces('karura');

    expect(result.experiences).toEqual([{ id: 'e1' }]);
    expect(result.places).toEqual([{ id: 'p1' }]);
    expect(result.communities).toEqual([{ id: 'c1' }]);
  });

  // Counts are the API's totals, not the page length — the popover asks for a
  // few rows but must report how many matched
  it('reports the API totals rather than the page length', async () => {
    mockExperiences.mockResolvedValue(page(24, [{ id: 'e1' }]));
    mockPlaces.mockResolvedValue(page(7, [{ id: 'p1' }]));
    mockCommunities.mockResolvedValue(page(2, [{ id: 'c1' }]));

    const { counts } = await searchPlaces('karura');

    expect(counts).toEqual({ experience: 24, place: 7, community: 2, total: 33 });
  });

  it('falls back to the page length when a response carries no count', async () => {
    mockExperiences.mockResolvedValue({ data: { results: [{ id: 'e1' }, { id: 'e2' }] } });

    const { counts } = await searchPlaces('karura');

    expect(counts.experience).toBe(2);
  });

  it('copes with an empty response', async () => {
    mockExperiences.mockResolvedValue({});
    mockPlaces.mockResolvedValue({});
    mockCommunities.mockResolvedValue({});

    const result = await searchPlaces('karura');

    expect(result.experiences).toEqual([]);
    expect(result.counts.total).toBe(0);
  });

  it('honours a custom page size', async () => {
    await searchPlaces('karura', undefined, 12);

    expect(mockPlaces).toHaveBeenCalledWith(1, 12, undefined, 'karura');
    expect(mockExperiences).toHaveBeenCalledWith(expect.objectContaining({ page_size: 12 }));
    expect(mockCommunities).toHaveBeenCalledWith(undefined, 1, 12, 'karura');
  });
});
