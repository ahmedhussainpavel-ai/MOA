import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    primary: "bg-moa-gold text-moa-dark hover:bg-moa-goldHover shadow-lg shadow-moa-gold/20",
    secondary: "bg-moa-brown text-moa-cream hover:bg-opacity-90",
    outline: "border-2 border-moa-gold text-moa-gold hover:bg-moa-gold hover:text-moa-dark",
    ghost: "text-moa-cream hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm text-moa-cream/70 ml-1">{label}</label>}
    <input 
      className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-moa-cream focus:outline-none focus:border-moa-gold transition-colors ${className}`}
      {...props}
    />
  </div>
);

// Card
export const Card: React.FC<HTMLMotionProps<"div">> = ({ children, className = '', ...props }) => (
  <motion.div 
    className={`bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4 ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Badge
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'info' }> = ({ children, variant = 'info' }) => {
  const colors = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${colors[variant]}`}>
      {children}
    </span>
  );
};
