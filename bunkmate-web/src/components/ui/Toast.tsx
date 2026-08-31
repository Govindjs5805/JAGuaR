import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore } from '../../state/toast';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-status-safe bg-status-safe/10',
  error: 'border-status-danger bg-status-danger/10',
  info: 'border-status-info bg-status-info/10',
  warning: 'border-status-warning bg-status-warning/10',
};

const iconColors = {
  success: 'text-status-safe',
  error: 'text-status-danger',
  info: 'text-status-info',
  warning: 'text-status-warning',
};

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`glass border rounded-xl p-4 min-w-[320px] max-w-md shadow-lg ${colors[toast.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary">{toast.title}</h4>
                  <p className="text-sm text-text-secondary mt-1">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
