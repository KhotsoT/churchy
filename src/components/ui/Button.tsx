import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined' | 'text';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'contained', 
  loading = false, 
  className = '',
  disabled,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="spinner"></span> : children}
    </button>
  );
}

