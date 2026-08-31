import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useNotificationStore } from '../../state/notifications';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left - Menu button (mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-primary hover:text-primary transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Center - Logo (mobile) */}
        <div className="lg:hidden">
          <h1 className="text-xl font-bold text-gradient">BunkMate</h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative text-text-secondary hover:text-text-primary transition-colors"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/settings')}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <User size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
