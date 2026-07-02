import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'glass' | 'yellow' | 'cyan' | 'orange' | 'green' | 'purple' | 'pink' | 'white' | 'black';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'red',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 select-none cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';
  
  // Custom button styling for glassmorphic/clinical red look
  const variantStyles = {
    red: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/15 hover:shadow-lg hover:shadow-red-500/25 border border-red-500/20 rounded-xl',
    glass: 'bg-white/60 hover:bg-white/90 backdrop-blur-sm text-neutral-800 border border-white/80 shadow-sm hover:border-neutral-200/40 rounded-xl',
    // Fallbacks to map previous code usages cleanly to the new style
    yellow: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/15 border border-red-500/20 rounded-xl',
    cyan: 'bg-white/60 hover:bg-white/90 backdrop-blur-sm text-neutral-800 border border-white/80 shadow-sm rounded-xl',
    orange: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/15 border border-red-500/20 rounded-xl',
    green: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/15 border border-red-500/20 rounded-xl',
    purple: 'bg-white/60 hover:bg-white/90 backdrop-blur-sm text-neutral-800 border border-white/80 shadow-sm rounded-xl',
    pink: 'bg-white/60 hover:bg-white/90 backdrop-blur-sm text-neutral-800 border border-white/80 shadow-sm rounded-xl',
    white: 'bg-white/60 hover:bg-white/90 backdrop-blur-sm text-neutral-800 border border-white/80 shadow-sm rounded-xl',
    black: 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-md rounded-xl',
  };

  const sizeStyles = {
    sm: 'text-xs py-2 px-4',
    md: 'text-sm py-2.5 px-6',
    lg: 'text-base py-3.5 px-8',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.red} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
