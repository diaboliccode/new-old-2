
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  'classic-light': {
    name: 'Classic White',
    class: '',
    icon: '☀️'
  },
  'classic-dark': {
    name: 'Classic Dark',
    class: 'dark',
    icon: '🌙'
  },
  'dark-green': {
    name: 'Dark Green',
    class: 'theme-dark-green',
    icon: '🌿'
  },
  'dark-blue': {
    name: 'Dark Blue',
    class: 'theme-dark-blue',
    icon: '🌊'
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('dark-green');

  useEffect(() => {
    const savedTheme = localStorage.getItem('securechat-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    Object.values(themes).forEach(theme => {
      if (theme.class) {
        root.classList.remove(theme.class);
      }
    });
    
    // Add current theme class
    const themeClass = themes[currentTheme]?.class;
    if (themeClass) {
      root.classList.add(themeClass);
    }
    
    localStorage.setItem('securechat-theme', currentTheme);
  }, [currentTheme]);

  const switchTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themes,
      switchTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
