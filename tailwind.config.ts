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
        'deep-blue': '#0054A6',
        'bright-blue': '#00AEEF',
        'orange': '#F7941D',
        'dark-orange': '#D35400',
        'brown': '#B8864C',
        'green': '#22B14C',
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'sans-serif'],
        body: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
