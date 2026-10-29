import { aboutStepSchema, socialLinksStepSchema, zodErrorsToMap } from './schemas';

const about = (extra: Record<string, unknown> = {}) => ({
  title: 'Kraftory',
  description: '<p>A garden</p>',
  address: '89 Ruaka Rd',
  googleMapPlaceId: '',
  entry: 'free' as const,
  photos: [{ id: 'ph1', url: 'https://cdn.test/1.jpg' }],
  ...extra,
});

describe('edit place schemas', () => {
  it('accepts a place loaded straight from the API', () => {
    expect(aboutStepSchema.safeParse(about()).success).toBe(true);
  });

  // The editor emits markup even when the writer cleared it, so an empty
  // description arrives as tags rather than an empty string
  it('does not mistake empty markup for a description', () => {
    const result = aboutStepSchema.safeParse(about({ description: '<p><br></p>' }));

    expect(result.success).toBe(false);
    expect(zodErrorsToMap(result.error!).description).toBe('Describe the place');
  });

  it('will not save a place with no photos', () => {
    const result = aboutStepSchema.safeParse(about({ photos: [] }));

    expect(zodErrorsToMap(result.error!).photos).toBe('Add at least one photo');
  });

  it('names the row a bad link is in', () => {
    const result = socialLinksStepSchema.safeParse({
      socialLinks: [
        { id: 'sl1', platformName: 'Instagram', url: 'https://instagram.com/kraftory' },
        { id: 'sl2', platformName: 'TikTok', url: 'tiktok.com/kraftory' },
      ],
    });

    expect(zodErrorsToMap(result.error!)['socialLinks.1.url']).toMatch(/full link/);
  });
});
