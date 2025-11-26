import React from 'react';
import './Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({ 
  children, 
  className = '', 
  title,
  variant = 'default',
  padding = 'medium',
  onClick,
  ...props
}: CardProps) {
  return (
    <div 
      className={`card card-${variant} card-padding-${padding} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
}

