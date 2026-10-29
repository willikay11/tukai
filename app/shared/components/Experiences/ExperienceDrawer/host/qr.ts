import QRCode from 'qrcode';

/** A scannable code for the given link, as a data URL. */
export const qrDataUrl = (link: string): Promise<string> =>
  QRCode.toDataURL(link, { margin: 1, color: { dark: '#013334', light: '#FFFFFF' } });
