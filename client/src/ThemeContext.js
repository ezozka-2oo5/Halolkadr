import React, { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    const currentTheme = darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(currentTheme);
    document.documentElement.style.colorScheme = currentTheme;
  }, [darkMode]);

  return (
    <ThemeContext.Provider
      value={{ darkMode, setDarkMode, theme: darkMode ? 'dark' : 'light' }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
