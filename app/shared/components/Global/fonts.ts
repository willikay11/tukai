import { Figtree } from 'next/font/google';

/**
 * The app's typeface.
 *
 * `next/font/google` fetches Figtree at BUILD time and serves it from this
 * app's own domain, so there is no request to Google at runtime, no font files
 * in the repo, and no download step for anyone cloning it.
 *
 * Figtree rather than one of the other near-matches for Satoshi: the app sets
 * `font-black` in 23 places, and Manrope and Plus Jakarta Sans both stop at
 * 800 - those would be faux-bolded by the browser, which is the problem this
 * swap is fixing.
 *
 * No `weight`, so the variable font ships: one file covering 300-900, where
 * the five static Satoshi cuts it replaces carried 300, 400, 500, 800 and 900
 * and left `font-semibold` (293 uses) and `font-bold` (254) to be synthesised.
 */
export const appFont = Figtree({
  subsets: ['latin'],
  // The text is readable in the fallback while the font arrives, rather than
  // invisible
  display: 'swap',
});
