/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'duo-primary': '#8056F0',
        'duo-secondary': '#6023D2',
        'duo-text-primary': '#313035',
        'duo-text-secondary': '#525058',
        'duo-text-error': '#AF0000',
        'duo-border': '#CBD5E1',
        'duo-neutral': '#878787',
        'duo-bg-purple': '#E9E5FD',
        'duo-bg-gray': '#F8F9FA',
      },
      fontFamily: {
        'outfit': ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

