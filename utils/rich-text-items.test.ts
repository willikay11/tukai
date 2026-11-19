import { richTextItems } from './rich-text-items';

// The rich-text editor's output, as it reached Review (DEV-511)
const EDITOR_LIST =
  '<ul class="m-0 p-0 list-outside [&amp;&gt;li]:mt-2 !list-disc">' +
  '<li value="1" class="mx-8"><span style="white-space: pre-wrap;">A curated dinner experience at a selected Nairobi venue</span></li>' +
  '<li value="2" class="mx-8"><span style="white-space: pre-wrap;">A shared meal with other guests</span></li>' +
  '<li value="3" class="mx-8"><span style="white-space: pre-wrap;">Food &amp; drinks</span></li>' +
  '</ul>';

describe('richTextItems', () => {
  it('reads the list items out of the editor HTML, without tags', () => {
    expect(richTextItems(EDITOR_LIST)).toEqual([
      'A curated dinner experience at a selected Nairobi venue',
      'A shared meal with other guests',
      'Food & drinks',
    ]);
  });

  it('takes paragraphs as items, and splits one on a line break', () => {
    expect(
      richTextItems('<p><span>Transport</span></p><p>Accommodation<br>Tips</p><p><br></p>'),
    ).toEqual(['Transport', 'Accommodation', 'Tips']);
  });

  it('keeps plain text one item per line, as older values are', () => {
    expect(richTextItems('Transport\n\n  Accommodation  \n')).toEqual([
      'Transport',
      'Accommodation',
    ]);
  });

  it('is empty for nothing, or for an editor left blank', () => {
    expect(richTextItems(undefined)).toEqual([]);
    expect(richTextItems('')).toEqual([]);
    expect(richTextItems('<p><br></p>')).toEqual([]);
  });
});
