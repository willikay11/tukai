/**
 * @jest-environment node
 */
import { generateMetadata } from './page';

const fetchPlace = jest.fn();
jest.mock('@/services/place', () => ({ fetchPlace: (...args: unknown[]) => fetchPlace(...args) }));
jest.mock('./components/PlaceDetailContent', () => ({ PlaceDetailContent: () => null }));

// DEV-409: the description is rich-text HTML; previews and search read text
describe('the place page’s metadata', () => {
  it('describes the place in plain text, entities decoded, paragraphs apart', async () => {
    fetchPlace.mockResolvedValue({
      data: {
        id: 'pl1',
        slug: 'kazuri',
        title: 'Kazuri Beads',
        description: '<p>Beads &amp; pottery.</p><p>Made by hand.</p>',
      },
    });

    const metadata = await generateMetadata({ params: { placeId: 'pl1' } });

    expect(metadata.description).toBe('Beads & pottery. Made by hand.');
  });
});
