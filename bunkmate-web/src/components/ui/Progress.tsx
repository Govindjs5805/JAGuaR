import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  status?: 'safe' | 'warning' | 'danger';
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  status,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (status === 'danger') return '#ef4444';
    if (status === 'warning') return '#f59e0b';
    if (status === 'safe') return '#22c55e';
    return '#10b981';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 8px ${getColor()}40)`,
          }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

interface LinearProgressProps {
  percentage: number;
  height?: number;
  showPercentage?: boolean;
  status?: 'safe' | 'warning' | 'danger';
  className?: string;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  percentage,
  height = 8,
  showPercentage = false,
  status,
  className,
}) => {
  const getColor = () => {
    if (status === 'danger') return 'bg-status-danger';
    if (status === 'warning') return 'bg-status-warning';
    if (status === 'safe') return 'bg-status-safe';
    return 'bg-primary';
  };

  return (
    <div className={clsx('w-full', className)}>
      <div
        className="w-full bg-border rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className={clsx('h-full rounded-full', getColor())}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            boxShadow: status ? `0 0 10px ${getColor()}` : undefined,
          }}
        />
      </div>
      {showPercentage && (
        <p className="text-sm text-text-secondary mt-1 text-right">
          {percentage.toFixed(1)}%
        </p>
      )}
    </div>
  );
};
