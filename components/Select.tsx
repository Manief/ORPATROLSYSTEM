
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  containerClassName?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, children, containerClassName = '', ...props }) => {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
        {label}
      </label>
      <select
        id={id}
        className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
