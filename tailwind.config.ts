import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
      colors: {
        void:    '#07070e',
        deep:    '#0c0c18',
        surface: '#111120',
        raised:  '#181830',
        overlay: '#1f1f3a',
        accent:  '#7c6fff',
        gold:    '#e8a020',
        green:   '#00c97a',
        red:     '#ff4055',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
