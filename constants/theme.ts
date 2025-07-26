export const LightTheme = {
  mode: 'light',
  colors: {
    primary: '#6A0DAD',
    background: '#FFFFFF',
    text: '#000000',
    surface: '#F5F5F5',
    textSecondary: '#666666',
    card: '#FFFFFF',
    border: '#E5E5E5',
    accent: '#F3E8FF',
    textDim: '#999999',
    success: '#10B981',
    error: '#EF4444', // red-500
    warning: '#F59E42', // amber-400
    notification: '#3B82F6', // blue-500
  },
};

export const DarkTheme = {
  mode: 'dark',
  colors: {
    primary: '#0078d4', // Microsoft Teams accent blue
    background: '#070c18', // Recording screen gradient start color
    text: '#FFFFFF', // Microsoft Teams white text
    surface: '#0a1420', // Darker surface for better contrast
    textSecondary: '#CCCCCC', // Microsoft Teams secondary text
    card: '#0f1a28', // Darker card color for better distinction
    border: '#1a2332', // Slightly lighter than surface for subtle borders
    accent: '#0078d4', // Microsoft Teams accent blue
    textDim: '#8a9bb8', // Softer blue-gray for dimmed text
    success: '#107C10', // Microsoft Teams success green
    error: '#D13438', // Microsoft Teams error red
    warning: '#FF8C00', // Microsoft Teams warning orange
    notification: '#0078d4', // Microsoft Teams notification blue
  },
};

// Optionally export a type for typing usage
export type AppTheme = typeof LightTheme;
