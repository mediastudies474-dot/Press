import { useState, useEffect } from 'react';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
const FONT_SCALE: Record<FontSize, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
};

export function useSettings() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('swazi-dark');
    return saved === null ? true : saved === 'true';
  });
  const [dataSaver, setDataSaver] = useState(() => {
    return localStorage.getItem('swazi-datasaver') === 'true';
  });
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('swazi-fontsize') as FontSize) || 'md';
  });
  const [autoplay, setAutoplay] = useState(() => {
    const v = localStorage.getItem('swazi-autoplay');
    return v === null ? true : v === 'true';
  });
  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('swazi-push') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('swazi-dark', String(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('swazi-datasaver', String(dataSaver));
  }, [dataSaver]);

  useEffect(() => {
    localStorage.setItem('swazi-fontsize', fontSize);
    document.documentElement.style.setProperty('--app-font-size', FONT_SCALE[fontSize]);
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('swazi-autoplay', String(autoplay));
  }, [autoplay]);

  useEffect(() => {
    localStorage.setItem('swazi-push', String(pushEnabled));
  }, [pushEnabled]);

  return {
    darkMode, setDarkMode,
    dataSaver, setDataSaver,
    fontSize, setFontSize,
    autoplay, setAutoplay,
    pushEnabled, setPushEnabled,
  };
}
