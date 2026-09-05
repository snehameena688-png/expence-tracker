import React from 'react';
import { BottomSheet } from '../bottom-sheet/BottomSheet';
import { useTheme } from '../../context/ThemeContext';
import type { AccentColor, FontSize } from '../../models/theme';
import { Check, Moon, Sun } from 'lucide-react';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS: { label: string; value: AccentColor }[] = [
  { label: 'iOS Blue', value: '#007AFF' },
  { label: 'Emerald', value: '#34C759' },
  { label: 'Indigo', value: '#5856D6' },
  { label: 'Amber', value: '#FF9500' },
  { label: 'Rose', value: '#FF2D55' },
];

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { mode, fontSize, accentColor, setMode, setFontSize, setAccentColor } = useTheme();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Appearance & Customization">
      {/* Theme Mode */}
      <div className="form-group">
        <label className="form-label">Theme Mode</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className={`btn ${mode === 'light' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('light')}
          >
            <Sun size={18} /> Light
          </button>
          <button
            type="button"
            className={`btn ${mode === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('dark')}
          >
            <Moon size={18} /> Dark
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div className="form-group">
        <label className="form-label">Font Size</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
          {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
            <button
              key={size}
              type="button"
              className={`btn ${fontSize === size ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize', fontSize: 'var(--font-sm)', padding: '10px' }}
              onClick={() => setFontSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Accent Color */}
      <div className="form-group">
        <label className="form-label">Accent Color</label>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'space-around', padding: 'var(--space-2) 0' }}>
          {ACCENT_COLORS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setAccentColor(item.value)}
              title={item.label}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: item.value,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: accentColor === item.value ? '0 0 0 3px var(--color-surface), 0 0 0 5px ' + item.value : 'none',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {accentColor === item.value && <Check size={20} strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Done
        </button>
      </div>
    </BottomSheet>
  );
};
