import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingButton.css';

const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '', 
  type = 'button', 
  onClick, 
  icon: Icon,
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`loading-btn ${className} ${loading ? 'loading-btn--loading' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      <span className="loading-btn-content">
        {loading ? (
          <Loader2 className="loading-btn-spinner" size={18} />
        ) : (
          Icon && <Icon className="loading-btn-icon" size={18} />
        )}
        {children}
      </span>
    </button>
  );
};

export default LoadingButton;
