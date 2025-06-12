import React from 'react';

// Kollywood light theme: primary pink, white secondary, blackish accent
const theme = {
  '--primary': '#fc037b',
  '--secondary': '#fbf9f9',
  '--accent': '#121212',
  '--danger': '#c80a2e',
  '--success': '#2eb872',
  '--info': '#36cdb4',
  '--warn': '#ff9b2e',
  '--game-bg': '#fceefa',
  '--game-card': '#fff0f5',
  '--game-header': '#fae2f2',
  '--quiz-shadow': '0 2px 8px rgba(252,3,123,0.10), 0 1.5px 4px 0 rgba(18,18,18,0.10)',
};

// PUBLIC_INTERFACE
function ThemeProvider({ children }) {
  React.useEffect(() => {
    Object.entries(theme).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
  }, []);
  return children;
}

export default ThemeProvider;
