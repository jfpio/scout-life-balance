import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "min-h-12 px-6 rounded-full font-display text-sm font-bold tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--slb-pine)] text-white shadow-[0_14px_28px_rgba(47,90,69,0.22)] hover:brightness-105",
    secondary: "border border-[var(--slb-line)] bg-white text-[var(--slb-pine)] shadow-sm hover:bg-[#FBFAF6]",
    outline: "border-2 border-[var(--slb-pine)] bg-transparent text-[var(--slb-pine)] hover:bg-white/60",
    danger: "bg-[var(--slb-orange)] text-white shadow-[0_14px_28px_rgba(201,106,46,0.2)] hover:brightness-105"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
