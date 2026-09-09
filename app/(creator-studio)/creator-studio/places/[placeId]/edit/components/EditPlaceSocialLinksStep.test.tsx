import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SocialLinkValue } from '../schemas';
import { EditPlaceSocialLinksStep, iconForPlatform } from './EditPlaceSocialLinksStep';

const onChange = jest.fn();

const link = (extra: Partial<SocialLinkValue> = {}): SocialLinkValue => ({
  id: 'sl1',
  platformName: 'Instagram',
  url: 'https://www.instagram.com/lorderroll/?hl=en',
  icon: 'InstagramIcon',
  ...extra,
});

const renderStep = (socialLinks: SocialLinkValue[] = [link()], errors = {}) =>
  render(
    <EditPlaceSocialLinksStep socialLinks={socialLinks} errors={errors} onChange={onChange} />,
  );

describe('EditPlaceSocialLinksStep', () => {
  beforeEach(() => jest.clearAllMocks());

  it('heads each link with its platform, and labels both fields', () => {
    renderStep();

    expect(screen.getByRole('heading', { name: 'Social Links' })).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Link 1 platform')).toHaveValue('Instagram');
    expect(screen.getByLabelText('Link 1 URL')).toHaveValue(
      'https://www.instagram.com/lorderroll/?hl=en',
    );
  });

  it('names an unnamed link by its position rather than leaving the heading blank', () => {
    renderStep([link({ platformName: '' })]);

    expect(screen.getByText('Link 1')).toBeInTheDocument();
  });

  it('removes the link it is asked to', async () => {
    const user = userEvent.setup();
    renderStep([link(), link({ id: 'sl2', platformName: 'Website' })]);

    await user.click(screen.getByRole('button', { name: 'Remove Instagram' }));

    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ id: 'sl2' })]);
  });

  it('adds an empty link to fill in', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByRole('button', { name: /Add social link/ }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'sl1' }),
      expect.objectContaining({ platformName: '', url: '' }),
    ]);
  });

  // The place page renders whatever icon is stored, so naming the platform has
  // to pick one
  it('follows the platform with its icon', async () => {
    const user = userEvent.setup();
    renderStep([link({ platformName: '', icon: 'Link01Icon' })]);

    await user.type(screen.getByLabelText('Link 1 platform'), 'W');

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ platformName: 'W', icon: 'Link01Icon' }),
    ]);
  });

  it('maps the platforms places actually store', () => {
    // These are the names the API returned for The Lord Erroll
    expect(iconForPlatform('Instagram')).toBe('InstagramIcon');
    expect(iconForPlatform('Website')).toBe('Globe02Icon');
    expect(iconForPlatform('Something else')).toBe('Link01Icon');
  });

  it('shows a bad link against the row it is in', () => {
    renderStep([link(), link({ id: 'sl2', platformName: 'TikTok', url: 'tiktok.com' })], {
      'socialLinks.1.url': 'Enter a full link, starting with https://',
    });

    expect(screen.getByText('Enter a full link, starting with https://')).toBeInTheDocument();
  });
});
