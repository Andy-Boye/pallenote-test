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
    primary: '#6A0DAD',
    background: '#000000',
    text: '#FFFFFF',
    surface: '#18181B',
    textSecondary: '#AAAAAA',
    card: '#23232B',
    border: '#333333',
    accent: '#3B0764',
    textDim: '#666666',
    success: '#10B981',
    error: '#EF4444', // red-500
    warning: '#F59E42', // amber-400
    notification: '#3B82F6', // blue-500
  },
};

// Optionally export a type for typing usage
export type AppTheme = typeof LightTheme;
