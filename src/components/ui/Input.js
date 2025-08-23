'use client';

import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helper,
  type = 'text',
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 text-duo-text-primary bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-duo-primary/20 focus:border-duo-primary';
  
  const errorClasses = error 
    ? 'border-duo-text-error focus:border-duo-text-error focus:ring-duo-text-error/20' 
    : 'border-duo-border hover:border-duo-neutral';
    
  const disabledClasses = disabled 
    ? 'bg-duo-bg-gray cursor-not-allowed opacity-60' 
    : '';

  const inputClasses = `
    ${baseClasses}
    ${errorClasses}
    ${disabledClasses}
    ${className}
  `.trim();

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-duo-text-primary">
          {label}
          {required && <span className="text-duo-text-error ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      
      {helper && !error && (
        <p className="text-sm text-duo-text-secondary">{helper}</p>
      )}
      
      {error && (
        <p className="text-sm text-duo-text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;