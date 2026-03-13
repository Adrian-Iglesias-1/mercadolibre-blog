import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mercado-yellow': '#FFE600',
        'black-sh': '#0a0a0a',
        'surface-sh': '#111111',
        'surface2-sh': '#1a1a1a',
        'surface3-sh': '#242424',
        'accent-sh': '#e8ff47',
        'accent2-sh': '#ff6b35',
        'accent3-sh': '#47c8ff',
        'text-sh': '#f0ede8',
        'text-muted-sh': '#888',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(232,255,71,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(71,200,255,0.05) 0%, transparent 50%)',
      }
    },
  },
  plugins: [],
}
export default config
