export type ThemeMode = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type AccentColor = '#007AFF' | '#34C759' | '#5856D6' | '#FF9500' | '#FF2D55';

export interface ThemeConfig {
  mode: ThemeMode;
  fontSize: FontSize;
  accentColor: AccentColor;
}
