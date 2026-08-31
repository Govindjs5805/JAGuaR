import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '../state/notifications';
import { useToastStore } from '../state/toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { NotificationData } from '../types/notifications';
import { Bell, AlertCircle, CheckCircle, TrendingUp, X, ArrowLeft, ClipboardList } from 'lucide-react';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { notifications, isLoading, error, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationsStore();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications();
        // Count unread notifications
        const count = notifications.filter(n => !n.is_read).length;
        setUnreadCount(count);
      } catch (error: any) {
        showToast({
          title: 'Error',
          message: error.message || 'Failed to load notifications',
          type: 'error',
        });
      }
    };
    loadNotifications();
  }, [notifications.length]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      showToast({
        title: 'Success',
        message: 'All notifications marked as read',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to mark as read',
        type: 'error',
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      showToast({
        title: 'Success',
        message: 'Notification deleted',
        type: 'success',
      });
      // Refetch notifications
      fetchNotifications();
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to delete notification',
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
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
            <p className="text-text-secondary">
              Stay updated with important announcements and alerts
            </p>
          </div>
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="secondary"
                isLoading={isLoading}
                className="flex-1"
              >
                Mark All as Read ({unreadCount})
              </Button>
            )}
            <Button
              onClick={() => fetchNotifications()}
              variant="secondary"
              isLoading={isLoading}
            >
              <TrendingUp size={20} /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            key="total"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center py-4 border-border hover:shadow-md transition-shadow">
              <Badge variant="info" className="mb-2">
                Total
              </Badge>
              <p className="text-2xl font-bold text-text-primary">{notifications.length}</p>
            </Card>
          </motion.div>
          <motion.div
            key="unread"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center py-4 border-border hover:shadow-md transition-shadow">
              <Badge variant="warning" className="mb-2">
                Unread
              </Badge>
              <p className="text-2xl font-bold text-text-primary">{unreadCount}</p>
            </Card>
          </motion.div>
          <motion.div
            key="important"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center py-4 border-border hover:shadow-md transition-shadow">
              <Badge variant="danger" className="mb-2">
                Important
              </Badge>
              <p className="text-2xl font-bold text-text-primary">
                {notifications.filter(n => n.is_important && !n.is_read).length}
              </p>
            </Card>
          </motion.div>
          <motion.div
            key="today"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="text-center py-4 border-border hover:shadow-md transition-shadow">
              <Badge variant="safe" className="mb-2">
                Today
              </Badge>
              <p className="text-2xl font-bold text-text-primary">
                {notifications.filter(n => {
                  const date = new Date(n.created_at);
                  const today = new Date();
                  return date.toDateString() === today.toDateString();
                }).length}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Notifications List */}
        {error && (
          <Card className="border-status-danger bg-status-danger/5">
            <div className="flex items-center gap-3 text-status-danger">
              <AlertCircle size={24} />
              <div>
                <h3 className="font-semibold">Error loading notifications</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-text-primary font-semibold mb-2">No Notifications</h3>
            <p className="text-text-secondary">
              You have no new notifications. Check back later for updates.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: NotificationData) => (
              <motion.div
                key={notification.notificationId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: notification.notificationId * 0.01 }}
              >
                <Card
                  hover
                  className={`border-t-4 border-primary ${!notification.is_read ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {notification.type === 'announcement' && (
                          <Bell size={24} className="text-info" />
                        )}
                        {notification.type === 'grade_update' && (
                          <CheckCircle size={24} className="text-success" />
                        )}
                        {notification.type === 'assignment_due' && (
                          <AlertCircle size={24} className="text-warning" />
                        )}
                        {notification.type === 'attendance_alert' && (
                          <AlertTriangle size={24} className="text-danger" />
                        )}
                        {notification.type === 'survey_available' && (
                          <ClipboardList size={24} className="text-primary" />
                        )}
                        {!notification.type && (
                          <Bell size={24} className="text-muted" />
                        )}
                        <div>
                          <h3 className="font-bold text-text-primary mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-text-muted text-sm">
                            {notification.category || 'General'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={notification.is_important ? 'danger' : 'info'}
                          className="text-xs px-2 py-1"
                        >
                          {notification.is_important ? 'Important' : 'Normal'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.notificationId);
                          }}
                          className="p-2"
                          title="Delete notification"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <p className="text-text-primary">{notification.message}</p>
                      {notification.action_url && (
                        <div className="mt-4">
                          <p className="text-text-muted text-sm font-medium">Action Required:</p>
                          <Button
                            onClick={() => {
                              // In a real app, this would navigate to the action URL
                              showToast({
                                title: 'Info',
                                message: 'Action link clicked: ' + notification.action_url,
                                type: 'info',
                              });
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <p className="text-text-muted text-sm">
                        <Bell size={16} className="mr-2" />
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      {!notification.is_read && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.notificationId);
                          }}
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};