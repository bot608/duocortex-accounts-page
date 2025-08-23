// DuoCortex Design System Theme
export const theme = {
  colors: {
    primary: '#8056F0',
    secondary: '#6023D2',
    text: {
      primary: '#313035',
      secondary: '#525058',
      error: '#AF0000',
    },
    neutral: {
      black: '#000000',
      border: '#CBD5E1',
      gray: '#878787',
    },
    background: {
      lightPurple: '#E9E5FD',
      white: '#FFFFFF',
      lightGray: '#F8F9FA',
    },
  },
  fonts: {
    primary: 'Outfit, system-ui, sans-serif',
    secondary: 'Roboto, system-ui, sans-serif',
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '15px',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  shadows: {
    card: '0 2px 10px rgba(0, 0, 0, 0.1)',
    button: '0 4px 12px rgba(128, 86, 240, 0.3)',
  },
};

// Tailwind CSS custom colors to match theme
export const tailwindColors = {
  'duo-primary': '#8056F0',
  'duo-secondary': '#6023D2',
  'duo-text-primary': '#313035',
  'duo-text-secondary': '#525058',
  'duo-text-error': '#AF0000',
  'duo-border': '#CBD5E1',
  'duo-neutral': '#878787',
  'duo-bg-purple': '#E9E5FD',
  'duo-bg-gray': '#F8F9FA',
};