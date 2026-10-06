type Contacts = typeof import('./contacts');

const loadContacts = (env: Record<string, string | undefined>): Contacts => {
  const original = { ...process.env };
  Object.entries(env).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
  let contacts!: Contacts;
  jest.isolateModules(() => {
    // Env is read at import time, so each case needs a fresh module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    contacts = require('./contacts');
  });
  process.env = original;
  return contacts;
};

describe('contacts config', () => {
  it('falls back to the current contact details when nothing is set', () => {
    const contacts = loadContacts({
      NEXT_PUBLIC_CONTACT_EMAIL: undefined,
      NEXT_PUBLIC_CONTACT_PHONE: undefined,
    });

    expect(contacts.CONTACT_EMAIL).toBe('support@tukai.co');
    expect(contacts.CONTACT_PHONE).toBe('+254 716 909 815');
    expect(contacts.CONTACT_PHONE_HREF).toBe('tel:+254716909815');
  });

  it('reads the email and phone from the environment', () => {
    const contacts = loadContacts({
      NEXT_PUBLIC_CONTACT_EMAIL: 'hello@example.com',
      NEXT_PUBLIC_CONTACT_PHONE: '+254 700 000 000',
    });

    expect(contacts.CONTACT_EMAIL).toBe('hello@example.com');
    expect(contacts.CONTACT_PHONE_HREF).toBe('tel:+254700000000');
  });

  it('hides a social link whose variable is set to empty', () => {
    const contacts = loadContacts({ NEXT_PUBLIC_SOCIAL_X: '' });

    expect(contacts.SOCIAL_LINKS.map((social) => social.label)).toEqual(['Instagram', 'Facebook']);
  });

  it('uses a social link set in the environment', () => {
    const contacts = loadContacts({
      NEXT_PUBLIC_SOCIAL_TIKTOK: 'https://tiktok.com/@tukai',
    });

    expect(contacts.SOCIAL_LINKS.find((social) => social.label === 'TikTok')?.href).toBe(
      'https://tiktok.com/@tukai',
    );
  });
});
