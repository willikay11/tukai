import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './public/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{js,ts,jsx,tsx}',
    // safeText generates Tailwind classes at runtime; without this they are
    // only emitted when the same utility happens to be used elsewhere
    './utils/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      /**
       * The canvas uses 29 distinct font sizes, half-pixels included — it was
       * drawn freehand, not off a scale. These are the five peaks Tailwind has
       * no default for; the half-steps beside them (12.5, 13.5, 14.5, 15.5)
       * round to their nearest neighbour rather than each earning a token.
       *
       * Additive, like the colours: `text-base` stays 16px. The canvas's body
       * size is 15px, and moving `base` would resize every screen at once.
       * Line heights follow the canvas's own ~1.5 ratio.
       */
      fontSize: {
        '13': ['13px', '18px'], // 103 uses — dense captions and meta lines
        '15': ['15px', '22px'], // 411 — the canvas's body size
        '17': ['17px', '24px'], // 65 — a heavy body line
        '19': ['19px', '26px'], // 118 — section headings
        '22': ['22px', '28px'], // 88 — screen titles
      },

      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
      },
      colors: {
        primary: {
          DEFAULT: 'rgba(var(--color-primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'rgba(var(--color-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        /**
         * Design-canvas tokens, named by the job they do rather than the hue.
         * Values are taken verbatim from the canvas; the number beside each is
         * how many times it appears there, which is what earned it a token.
         *
         * These are additive. `primary` (#047857) is deliberately untouched:
         * the canvas leads on `brand` (#066349), which this repo has only ever
         * used as a form-focus green, so swapping `primary` would repaint every
         * screen at once. Screens adopt `brand` as their task reaches them.
         */
        brand: {
          DEFAULT: '#066349', // 458 — the canvas's dominant green
          deep: '#044B36', // 86 — pressed, and text on pale green
          mid: '#0C7A50', // 53 — secondary actions
          ink: '#013334', // 368 — text sitting on lime
        },
        lime: {
          DEFAULT: '#B0E800', // 69
          dark: '#A3D900', // 27 — hover and pressed
        },
        // The two accents a meta line is made of: a rating's star, and the
        // dot between one fact and the next. Both sampled from the designs —
        // neither is a shade of the brand green, and both recur wherever a
        // rating or a "city • distance" line does.
        star: '#F2C14B',
        dot: '#70A3F3',
        // The blue dot before a distance or a rating count in the place drawer's
        // photo row, a 5px circle rather than a glyph
        distance: '#60A5FA',
        surface: {
          DEFAULT: '#F3F4F2', // 298 — resting chip and card ground
          brand: '#E8F1ED', // 280 — a chosen chip
          muted: '#EDF0EE', // 82 — a quieter panel
          tab: '#DCEAE3', // 13 — the selected tab pill, a shade deeper than brand
          pill: '#F3F4F6', // the resting section pill in the place drawer's tab row
          'pill-active': '#A7F3D0', // the selected section pill, a lime-tinted green
          // The hover on a brand-soft control, per the design's carousel-arrow
          // spec in docs/design/HANDOFF.md
          'brand-hover': '#D5E7DE',
        },
        line: {
          DEFAULT: '#DDE3DF', // 176 — hairline borders and dividers
          brand: '#CBDDD4', // 15 — the hairline on a green-faced control
          soft: '#E2E7E4', // 15 — the border on a white control, such as the account chip
        },
        ink: {
          DEFAULT: '#3F4B47', // 42 — strong body text
          muted: '#5B6B66', // 488 — secondary text, the canvas's workhorse
          subtle: '#8A9793', // 37 — hints and placeholders
          pill: '#1F2937', // the label and icon on a resting section pill
          summary: '#1F2937', // the one-line summary under a manager's banner title
          label: '#1F2937', // a fact's label and icon in the place drawer's facts grid
        },
        danger: {
          // ⚠️ The canvas carries three reds — #E02D3C (22), #D92D20 (15) and
          // #FE4A49 (14). This takes the most used; the others are left out
          // rather than tokenised, so a screen that needs one asks first.
          DEFAULT: '#E02D3C',
          surface: '#FEF3F2', // 15 — the ground a danger message sits on
        },
        'brand-green': {
          DEFAULT: 'rgba(var(--color-brand-green) / <alpha-value>)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'top-md': '0 -2px 10px -1px rgba(0, 0, 0, 0.1), 0 -2px 2px -1px rgba(0, 0, 0, 0.06)',
        'scroll-filters': '0 0px 8px 17px rgb(255 255 255), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'search-bar': '0 0px 15px 0px rgba(0, 0, 0, 0.15)',
        // The lift under a lime button in the place drawer's claim prompt
        'lime-glow': '0 8px 20px rgba(176, 232, 0, 0.4)',
      },
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        // A single confirmation beat — overshoot and settle. Used when
        // something is saved or toggled on, never on a loop.
        pop: {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pop: 'pop 300ms ease-out',
        'fade-in-up': 'fade-in-up 200ms ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        /**
         * Canvas radii Tailwind has no default for. The two it leans on
         * hardest already exist: 999px is `rounded-full` (587 uses) and 12px
         * is `rounded-xl` (255). These three fill the gaps between.
         */
        '10': '10px', // 25 uses
        '14': '14px', // 61 — cards and sheets
        '18': '18px', // 23 — the larger tiles
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    typography,
    plugin(({ addUtilities }) => {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};

export default config;
