import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  onClick,
}) => {
  const baseStyles = 'bg-background-card rounded-2xl p-6 border border-border transition-all duration-300';
  const hoverStyles = hover ? 'hover:shadow-card-hover hover:border-primary/30 hover:scale-[1.02] cursor-pointer' : '';

  if (onClick || hover) {
    return (
      <motion.div
        whileHover={hover ? { scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        className={clsx(baseStyles, hoverStyles, className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={clsx(baseStyles, className)}>
      {children}
    </div>
  );
};
