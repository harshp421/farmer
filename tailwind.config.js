/** @type {import('tailwindcss').Config} */
// Canopy design system — Organic Biophilic, dark-tech base + amber trust accents.
// Tokens are the single source of truth (CLAUDE.md §Design system). Do not invent
// ad-hoc colors per screen — derive state colors from `state.*` below.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light "warm paper" theme — cream surfaces, near-black ink, green accent.
        // Single confident accent (green), warm amber used sparingly for "pending".
        primary: { DEFAULT: '#15803D', soft: '#16A34A' }, // green — accents, links, badges
        secondary: '#B45309', // warm amber — pending/warning only, used sparingly
        cta: { DEFAULT: '#15803D', hover: '#166534' }, // green — Buy / Retire / Verify / Submit
        // App shell — names are semantic: 900 = page bg, 700 = card, 600 = border.
        ink: {
          900: '#F4F0E8', // app background (warm cream paper)
          800: '#FAF7F1', // raised / subtle surface (inputs)
          700: '#FFFFFF', // card
          600: '#E7E1D5', // border / hairline
        },
        body: '#17211A', // near-black warm ink (headings, body)
        muted: '#6E685D', // warm gray (secondary text)
        // Credit / plot state language — tuned for contrast on light surfaces.
        state: {
          verified: '#15803D', // green — verified / retired
          listed: '#B45309', // amber — listed
          sold: '#6E685D', // warm gray — sold
          rejected: '#DC2626', // red — rejected / reversed
          submitted: '#B45309', // amber — pending review
        },
      },
      fontFamily: {
        heading: ['"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Fira Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23, 33, 26, 0.04), 0 8px 24px -14px rgba(23, 33, 26, 0.18)',
        glow: '0 0 0 1px rgba(21, 128, 61, 0.12), 0 12px 32px -16px rgba(21, 128, 61, 0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 300ms ease-out both',
      },
    },
  },
  plugins: [],
};
