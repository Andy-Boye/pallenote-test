const tintColorLight = '#2f95dc';
const tintColorDark = '#0078d4'; // Microsoft Teams accent blue

const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF', // Microsoft Teams white text
    background: '#070c18', // Recording screen gradient start color
    tint: tintColorDark,
    icon: '#CCCCCC', // Microsoft Teams icon color
    tabIconDefault: '#8a9bb8', // Softer blue-gray for dimmed text
    tabIconSelected: tintColorDark,
  },
};
export default Colors;
