import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light shadow-glow-sm hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-background-elevated text-text-primary border border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-status-danger text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-text-primary hover:bg-background-elevated disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 16 : 20} />}
      {children}
    </motion.button>
  );
};
