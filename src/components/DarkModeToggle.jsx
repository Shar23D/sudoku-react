import React, { useState, useEffect } from 'react';

const DarkModeToggle = () => {
  // Check localStorage for any saved preference, default to false (light mode)
  const storedDarkMode = localStorage.getItem('darkMode') === 'true';
  const [isDarkMode, setIsDarkMode] = useState(storedDarkMode);

  // Toggle function to switch dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prevState => !prevState);
  };

  // Update body class and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  return (
    <div className="dark-mode-toggle">
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </button>
    </div>
  );
};

export default DarkModeToggle;
