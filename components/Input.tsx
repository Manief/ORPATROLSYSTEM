
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, containerClassName = '', ...props }) => {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
        {label}
      </label>
      <input
        id={id}
        className="block w-full px-3 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        {...props}
      />
    </div>
  );
};

export default Input;
