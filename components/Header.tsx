import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeContext } from '../App';
import { BuildingOffice2Icon, SunIcon, MoonIcon, QrCodeIcon, ClipboardDocumentListIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const navLinkClass = ({ isActive }: {isActive: boolean}) => 
    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-700 text-white'
        : 'text-blue-100 hover:bg-primary-600 hover:text-white'
    }`;
    
  return (
    <header className="bg-primary shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white flex items-center space-x-2">
                <BuildingOffice2Icon className="h-8 w-8"/>
                <span className="font-bold text-xl">QR Patrol System</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={navLinkClass}>
                    <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                    Dashboard
                </NavLink>
                <NavLink to="/setup" className={navLinkClass}>
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    Setup
                </NavLink>
                <NavLink to="/patrol" className={navLinkClass}>
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                    Start Patrol
                </NavLink>
                <NavLink to="/reports" className={navLinkClass}>
                    <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                    Reports
                </NavLink>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-blue-200 hover:bg-primary-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;