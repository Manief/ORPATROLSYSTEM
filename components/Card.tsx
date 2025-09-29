
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
      {title && (
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{title}</h3>
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
