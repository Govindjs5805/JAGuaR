import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'safe' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className }) => {
  const variants = {
    safe: 'bg-status-safe/20 text-status-safe border-status-safe/30',
    warning: 'bg-status-warning/20 text-status-warning border-status-warning/30',
    danger: 'bg-status-danger/20 text-status-danger border-status-danger/30',
    info: 'bg-status-info/20 text-status-info border-status-info/30',
  };

  return (
    <span
      className={clsx(
        'px-3 py-1 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
