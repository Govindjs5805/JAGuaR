import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAttendanceStore } from '../state/attendance';
import { useAuthStore } from '../state/auth';
import { useSettingsStore } from '../state/settings';
import { useToastStore } from '../state/toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CircularProgress, LinearProgress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import {
  calculateEnhancedAttendanceStats,
  calculateEnhancedClassesCanMiss,
  calculateEnhancedClassesToAttend,
  getAttendanceStatus,
} from '../utils/helpers';
import { Calendar, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, ArrowLeft } from 'lucide-react';

export const SubjectDetails: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();
  const { name } = useAuthStore();
  const { showToast } = useToastStore();
  const {
    data: attendanceData,
    courseSchedule,
    isLoading,
    error,
    lastUpdated,
    initFetchAttendance,
    refreshAttendance,
  } = useAttendanceStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initFetchAttendance();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAttendance();
      showToast({
        title: 'Success',
        message: 'Attendance data refreshed',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to refresh',
        type: 'error',
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (!subjectId) {
    navigate('/dashboard');
    return null;
  }

  const subject = attendanceData?.subjects.find(
    (s) => s.subject.id.toString() === subjectId
  );

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div>
          <AlertTriangle size={48} className="mx-auto text-status-danger mb-4" />
          <h2 className="text-2xl font-bold text-text-primary">Subject Not Found</h2>
          <p className="text-text-secondary">
            The requested subject data is not available.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="secondary">
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const userRecords = courseSchedule?.get(subjectId) || [];
  const stats = calculateEnhancedAttendanceStats(subject, userRecords);
  const canMiss = calculateEnhancedClassesCanMiss(stats);
  const toAttend = calculateEnhancedClassesToAttend(stats);

  if (isLoading && !attendanceData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
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
            <h1 className="text-2xl font-bold text-text-primary">
              {subject.subject.name}
            </h1>
            <p className="text-text-secondary">
              {subject.subject.code} • Detailed Attendance
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            isLoading={refreshing}
            variant="secondary"
            className="gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </Button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-center text-text-muted text-sm mb-6">
            Last updated {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}

        {/* Overall Stats Card */}
        <Card className="bg-gradient-primary text-white border-primary/30">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <CircularProgress
                percentage={stats.percentage}
                status={getAttendanceStatus(stats.percentage)}
                size={140}
              />
              <div>
                <h2 className="text-2xl font-bold mb-2">Subject Attendance</h2>
                <p className="text-white/80 text-sm">
                  {stats.attendedClasses} / {stats.totalClasses} classes
                </p>
                <div className="flex gap-2 mt-3">
                  {toAttend > 0 && (
                    <Badge variant="danger">
                      Need {toAttend} more
                    </Badge>
                  )}
                  {canMiss > 0 && (
                    <Badge variant="safe">
                      Can miss {canMiss}
                    </Badge>
                  )}
                  {toAttend === 0 && canMiss === 0 && (
                    <Badge variant="info">
                      On target
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Breakdown */}
        <div className="space-y-6">
          {/* Attendance Details */}
          <Card className="border-t-4 border-primary">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                Attendance Details
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-text-muted text-sm">Attended Classes</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.attendedClasses}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Total Classes</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.totalClasses}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Percentage</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.percentage.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-sm">Status</p>
                  <Badge
                    variant={getAttendanceStatus(stats.percentage)}
                    className="px-4 py-2 font-medium text-white"
                  >
                    {getAttendanceStatus(stats.percentage)
                      .charAt(0)
                      .toUpperCase() +
                    getAttendanceStatus(stats.percentage)
                      .slice(1)
                      .toLowerCase()}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <LinearProgress
                  percentage={stats.percentage}
                  status={getAttendanceStatus(stats.percentage)}
                  height={8}
                  className="mb-2"
                />
                <p className="text-center text-text-sm text-text-muted">
                  {stats.percentage.toFixed(1)}% Attendance
                </p>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          {(toAttend > 0 || canMiss > 0) && (
            <Card className="border-t-4 border-primary">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  Attendance Recommendations
                </h2>

                {toAttend > 0 && (
                  <div className="bg-status-danger/5 border border-status-danger/20 p-4 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp size={20} className="text-status-danger" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-status-danger">
                          Action Required
                        </h3>
                        <p className="text-status-danger">
                          To maintain minimum attendance, you need to attend
                          <span className="font-bold">{toAttend}</span> more classes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {canMiss > 0 && (
                  <div className="bg-status-safe/5 border border-status-safe/20 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingDown size={20} className="text-status-safe" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-status-safe">
                          You're Ahead
                        </h3>
                        <p className="text-status-safe">
                          You can miss up to <span className="font-bold">{canMiss}</span> more classes
                          and still maintain minimum attendance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {toAttend === 0 && canMiss === 0 && (
                  <div className="bg-status-info/5 border border-status-info/20 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-info" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-info">
                          On Target
                        </h3>
                        <p className="text-info">
                          Your attendance is perfectly on track to meet requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Class History */}
          {userRecords.length > 0 && (
            <Card className="border-t-4 border-primary">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  Recent Class Records
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  Last {Math.min(userRecords.length, 10)} attendance records
                </p>

                <div className="space-y-3">
                  {userRecords
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((record, index) => (
                      <motion.div
                        key={record.date || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className={`flex items-start gap-3 p-3 border border-border/50 rounded-lg ${
                          record.status === 1 ? 'bg-status-safe/5' : 'bg-status-danger/5'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            record.status === 1
                              ? 'bg-status-safe/20'
                              : 'bg-status-danger/20'
                          }`}>
                            {record.status === 1 ? (
                              <CheckCircle size={16} className="text-status-safe" />
                            ) : (
                              <AlertTriangle size={16} className="text-status-danger" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-text-primary font-medium">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                            <p className="text-text-muted text-sm">
                              {record.status === 1 ? 'Present' : 'Absent'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
};