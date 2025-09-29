
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Patrol from './pages/Patrol';
import Reports from './pages/Reports';
import Header from './components/Header';
import { ToastProvider } from './contexts/ToastContext';

export const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode: boolean) => !prevMode);
  };
  
  const themeValue = useMemo(() => ({ isDarkMode, toggleDarkMode }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <ToastProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/patrol" element={<Patrol />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </ToastProvider>
    </ThemeContext.Provider>
  );
};

export default App;
