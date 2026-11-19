/**
 * Every country's calling code, for a phone field that takes numbers from
 * anywhere. Names come from Intl.DisplayNames where it's available, so they
 * read in English without a name list here.
 *
 * Countries sharing a code (the NANP +1 group, +7, +44 crown dependencies)
 * each keep their own entry, so the picker shows the flag the host expects.
 */
import { toKenyanE164 } from '@/utils/phone';

const DIAL_CODES: Record<string, string> = {
  AF: '93',
  AL: '355',
  DZ: '213',
  AS: '1',
  AD: '376',
  AO: '244',
  AI: '1',
  AG: '1',
  AR: '54',
  AM: '374',
  AW: '297',
  AU: '61',
  AT: '43',
  AZ: '994',
  BS: '1',
  BH: '973',
  BD: '880',
  BB: '1',
  BY: '375',
  BE: '32',
  BZ: '501',
  BJ: '229',
  BM: '1',
  BT: '975',
  BO: '591',
  BA: '387',
  BW: '267',
  BR: '55',
  VG: '1',
  BN: '673',
  BG: '359',
  BF: '226',
  BI: '257',
  KH: '855',
  CM: '237',
  CA: '1',
  CV: '238',
  KY: '1',
  CF: '236',
  TD: '235',
  CL: '56',
  CN: '86',
  CO: '57',
  KM: '269',
  CG: '242',
  CD: '243',
  CK: '682',
  CR: '506',
  CI: '225',
  HR: '385',
  CU: '53',
  CW: '599',
  CY: '357',
  CZ: '420',
  DK: '45',
  DJ: '253',
  DM: '1',
  DO: '1',
  EC: '593',
  EG: '20',
  SV: '503',
  GQ: '240',
  ER: '291',
  EE: '372',
  SZ: '268',
  ET: '251',
  FK: '500',
  FO: '298',
  FJ: '679',
  FI: '358',
  FR: '33',
  GF: '594',
  PF: '689',
  GA: '241',
  GM: '220',
  GE: '995',
  DE: '49',
  GH: '233',
  GI: '350',
  GR: '30',
  GL: '299',
  GD: '1',
  GP: '590',
  GU: '1',
  GT: '502',
  GG: '44',
  GN: '224',
  GW: '245',
  GY: '592',
  HT: '509',
  HN: '504',
  HK: '852',
  HU: '36',
  IS: '354',
  IN: '91',
  ID: '62',
  IR: '98',
  IQ: '964',
  IE: '353',
  IM: '44',
  IL: '972',
  IT: '39',
  JM: '1',
  JP: '81',
  JE: '44',
  JO: '962',
  KZ: '7',
  KE: '254',
  KI: '686',
  XK: '383',
  KW: '965',
  KG: '996',
  LA: '856',
  LV: '371',
  LB: '961',
  LS: '266',
  LR: '231',
  LY: '218',
  LI: '423',
  LT: '370',
  LU: '352',
  MO: '853',
  MG: '261',
  MW: '265',
  MY: '60',
  MV: '960',
  ML: '223',
  MT: '356',
  MH: '692',
  MQ: '596',
  MR: '222',
  MU: '230',
  YT: '262',
  MX: '52',
  FM: '691',
  MD: '373',
  MC: '377',
  MN: '976',
  ME: '382',
  MS: '1',
  MA: '212',
  MZ: '258',
  MM: '95',
  NA: '264',
  NR: '674',
  NP: '977',
  NL: '31',
  NC: '687',
  NZ: '64',
  NI: '505',
  NE: '227',
  NG: '234',
  KP: '850',
  MK: '389',
  MP: '1',
  NO: '47',
  OM: '968',
  PK: '92',
  PW: '680',
  PS: '970',
  PA: '507',
  PG: '675',
  PY: '595',
  PE: '51',
  PH: '63',
  PL: '48',
  PT: '351',
  PR: '1',
  QA: '974',
  RE: '262',
  RO: '40',
  RU: '7',
  RW: '250',
  BL: '590',
  SH: '290',
  KN: '1',
  LC: '1',
  MF: '590',
  PM: '508',
  VC: '1',
  WS: '685',
  SM: '378',
  ST: '239',
  SA: '966',
  SN: '221',
  RS: '381',
  SC: '248',
  SL: '232',
  SG: '65',
  SX: '1',
  SK: '421',
  SI: '386',
  SB: '677',
  SO: '252',
  ZA: '27',
  KR: '82',
  SS: '211',
  ES: '34',
  LK: '94',
  SD: '249',
  SR: '597',
  SE: '46',
  CH: '41',
  SY: '963',
  TW: '886',
  TJ: '992',
  TZ: '255',
  TH: '66',
  TL: '670',
  TG: '228',
  TO: '676',
  TT: '1',
  TN: '216',
  TR: '90',
  TM: '993',
  TC: '1',
  TV: '688',
  UG: '256',
  UA: '380',
  AE: '971',
  GB: '44',
  US: '1',
  UY: '598',
  VI: '1',
  UZ: '998',
  VU: '678',
  VA: '39',
  VE: '58',
  VN: '84',
  WF: '681',
  EH: '212',
  YE: '967',
  ZM: '260',
  ZW: '263',
};

export type DialCountry = { iso: string; name: string; dialCode: string; flag: string };

const flagOf = (iso: string) =>
  String.fromCodePoint(...iso.split('').map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));

const nameOf = (() => {
  try {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return (iso: string) => names.of(iso) ?? iso;
  } catch {
    return (iso: string) => iso;
  }
})();

/** Every country, A to Z by name. */
export const DIAL_COUNTRIES: DialCountry[] = Object.entries(DIAL_CODES)
  .map(([iso, dialCode]) => ({ iso, name: nameOf(iso), dialCode, flag: flagOf(iso) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const dialCountry = (iso: string): DialCountry | undefined =>
  DIAL_COUNTRIES.find((country) => country.iso === iso);

/**
 * A number in E.164 for a country: "+447700900123". A leading 0 (the
 * national trunk prefix most countries use) is dropped. A number typed with
 * its own + is kept as typed.
 *
 * Only Kenya also drops its code typed again ("254712..."), as the field
 * always did: elsewhere a code can be the start of a real local number (in
 * Brazil, area code 55 is also the country code), so it is left alone.
 */
export const toE164 = (iso: string, raw: string): string => {
  const code = DIAL_CODES[iso];
  const digits = raw.replace(/\D/g, '');
  if (!digits || !code) return '';
  if (raw.trim().startsWith('+')) return `+${digits}`;
  if (iso === 'KE') return toKenyanE164(digits);
  return `+${code}${digits.replace(/^0+/, '')}`;
};

/**
 * Which country a stored "+44..." number belongs to - the longest code that
 * matches, so +1 868 isn't read as +1. Shared codes go to the first country
 * listed with them, unless `prefer` names one of them.
 */
export const countryOfNumber = (e164: string, prefer?: string): DialCountry | undefined => {
  const digits = e164.replace(/\D/g, '');
  const matches = DIAL_COUNTRIES.filter((country) => digits.startsWith(country.dialCode));
  if (!matches.length) return undefined;
  const longest = Math.max(...matches.map((country) => country.dialCode.length));
  const best = matches.filter((country) => country.dialCode.length === longest);
  return best.find((country) => country.iso === prefer) ?? best[0];
};
