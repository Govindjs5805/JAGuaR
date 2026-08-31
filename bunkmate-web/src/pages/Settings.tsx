import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/auth';
import { useSettingsStore } from '../state/settings';
import { useToastStore } from '../state/toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { User, Bell, Moon, Sun, AlertTriangle, CheckCircle, TrendingUp, LogOut, ArrowLeft, Calendar, X } from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { name, logout } = useAuthStore();
  const { showToast } = useToastStore();
  const {
    settings,
    updateSetting,
    isLoading,
    error,
    clearData,
    exportData,
  } = useSettingsStore();

  const [notificationEnabled, setNotificationEnabled] = useState(settings?.notifications_enabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState(settings?.email_notifications ?? true);
  const [theme, setTheme] = useState(settings?.theme ?? 'dark-green');

  useEffect(() => {
    // Sync with settings store
    if (settings) {
      setNotificationEnabled(settings.notifications_enabled ?? true);
      setEmailEnabled(settings.email_notifications ?? true);
      setTheme(settings.theme ?? 'dark-green');
    }
  }, [settings]);

  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        title: 'Success',
        message: 'Logged out successfully',
        type: 'success',
      });
      navigate('/login');
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to logout',
        type: 'error',
      });
    }
  };

  const handleClearData = async () => {
    if (areYouSure('This will delete all local data. This action cannot be undone. Continue?')) {
      try {
        await clearData();
        showToast({
          title: 'Success',
          message: 'All local data cleared successfully',
          type: 'success',
        });
      } catch (error: any) {
        showToast({
          title: 'Error',
          message: error.message || 'Failed to clear data',
          type: 'error',
        });
      }
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      showToast({
        title: 'Success',
        message: 'Data exported successfully',
        type: 'success',
      });
      // In a real app, this would trigger a download
      console.log('Exported data:', data);
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to export data',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => fetchSettings()}
              variant="secondary"
              isLoading={isLoading}
            >
              <TrendingUp size={20} /> Refresh
            </Button>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="border-t-4 border-primary">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary">{name || 'Student'}</h3>
                  <p className="text-text-secondary">BunkMate User</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-warning" />
                <div className="flex-1">
                  <p className="text-text-muted">
                    Profile information is managed through your KTU account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="border-t-4 border-primary">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-info" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">In-app Notifications</p>
                  <p className="text-text-primary">Receive notifications within the app</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-full transition-all ${
                    notificationEnabled
                      ? 'border-primary/20 bg-primary/10'
                      : 'border-border/50 bg-background-elevated'
                  }`}
                  onClick={() => {
                    setNotificationEnabled(!notificationEnabled);
                    updateSetting('notifications_enabled', notificationEnabled);
                  }}
                >
                  {notificationEnabled ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" />
                      <span className="text-text-primary">Enabled</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X size={16} className="text-muted" />
                      <span className="text-text-muted">Disabled</span>
                    </div>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Bell size={20} className="text-info" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">Email Notifications</p>
                  <p className="text-text-primary">Receive important updates via email</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-full transition-all ${
                    emailEnabled
                      ? 'border-primary/20 bg-primary/10'
                      : 'border-border/50 bg-background-elevated'
                  }`}
                  onClick={() => {
                    setEmailEnabled(!emailEnabled);
                    updateSetting('email_notifications', emailEnabled);
                  }}
                >
                  {emailEnabled ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" />
                      <span className="text-text-primary">Enabled</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X size={16} className="text-muted" />
                      <span className="text-text-muted">Disabled</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="border-t-4 border-primary">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Moon size={20} className="text-muted" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">Dark Theme</p>
                  <p className="text-text-primary">Dark green theme optimized for reduced eye strain</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-full transition-all ${
                    theme === 'dark-green'
                      ? 'border-primary/20 bg-primary/10'
                      : 'border-border/50 bg-background-elevated'
                  }`}
                  onClick={() => {
                    setTheme('dark-green');
                    updateSetting('theme', 'dark-green');
                  }}
                >
                  {theme === 'dark-green' ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" />
                      <span className="text-text-primary">Selected</span>
                    </div>
                  ) : (
                    <Moon size={16} className="text-muted" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Sun size={20} className="text-muted" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">Light Theme</p>
                  <p className="text-text-primary">Light theme for bright environments</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-full transition-all ${
                    theme === 'light'
                      ? 'border-primary/20 bg-primary/10'
                      : 'border-border/50 bg-background-elevated'
                  }`}
                  onClick={() => {
                    setTheme('light');
                    updateSetting('theme', 'light');
                  }}
                >
                  {theme === 'light' ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" />
                      <span className="text-text-primary">Selected</span>
                    </div>
                  ) : (
                    <Sun size={16} className="text-muted" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="border-t-4 border-primary">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">Data Management</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} className="text-info" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">Export Data</p>
                  <p className="text-text-primary">Download your attendance and assignment data</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportData}
                  isLoading={isLoading}
                >
                  Export Data
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-danger" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">Clear All Data</p>
                  <p className="text-text-primary">Delete all locally stored data (cannot be undone)</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearData}
                  isLoading={isLoading}
                >
                  Clear Data
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="border-t-4 border-primary">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">About BunkMate</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-success" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">Version</p>
                  <p className="text-text-primary">1.0.0</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-muted" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">Last Updated</p>
                  <p className="text-text-primary">August 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User size={20} className="text-muted" />
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">Created For</p>
                  <p className="text-text-primary">KTU Students</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-center text-text-muted text-sm">
                BunkMate © 2024 • Made with ❤️ for KTU Students
              </p>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full max-w-md"
          >
            <LogOut size={20} className="mr-2" />
            Log Out
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function for confirmation dialog
function areYouSure(message: string): boolean {
  return window.confirm(message);
}