import { Experience } from '@/types/experience';

import { featuredOnly } from './featured-experiences';

const experience = (id: string, featured?: boolean) =>
  ({ id, title: id, ...(featured === undefined ? {} : { featured }) }) as unknown as Experience;

describe('featuredOnly', () => {
  it('keeps the experiences the editors featured, in the order given', () => {
    const list = [experience('a', false), experience('b', true), experience('c', true)];

    expect(featuredOnly(list).map((e) => e.id)).toEqual(['b', 'c']);
  });

  // Nothing is shown as featured that was not chosen: a missing flag is not a
  // yes
  it('leaves out anything without the flag', () => {
    expect(featuredOnly([experience('a'), experience('b', false)])).toEqual([]);
  });

  it('is empty when nothing is featured, so the rail is hidden', () => {
    expect(featuredOnly([])).toEqual([]);
  });
});
