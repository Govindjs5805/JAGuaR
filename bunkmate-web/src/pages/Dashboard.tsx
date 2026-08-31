import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Filter, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAttendanceStore } from '../state/attendance';
import { useAuthStore } from '../state/auth';
import { useSettingsStore } from '../state/settings';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CircularProgress, LinearProgress } from '../components/ui/Progress';
import { Spinner } from '../components/ui/Spinner';
import { useToastStore } from '../state/toast';
import {
  calculateEnhancedAttendanceStats,
  calculateEnhancedClassesCanMiss,
  calculateEnhancedClassesToAttend,
  getAttendanceStatus,
} from '../utils/helpers';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
  const [filter, setFilter] = useState<'all' | 'danger' | 'warning' | 'safe'>('all');

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

  const enhancedSubjects = attendanceData?.subjects.map((subject) => {
    const userRecords = courseSchedule?.get(subject.subject.id.toString()) || [];
    const stats = calculateEnhancedAttendanceStats(subject, userRecords);
    const canMiss = calculateEnhancedClassesCanMiss(stats);
    const toAttend = calculateEnhancedClassesToAttend(stats);

    return {
      ...subject,
      enhanced: {
        ...stats,
        canMiss,
        toAttend,
        status: getAttendanceStatus(stats.percentage),
      },
    };
  }) || [];

  const filteredSubjects = enhancedSubjects.filter((s) => {
    if (filter === 'all') return true;
    return s.enhanced.status === filter;
  });

  const dangerCount = enhancedSubjects.filter((s) => s.enhanced.status === 'danger').length;
  const warningCount = enhancedSubjects.filter((s) => s.enhanced.status === 'warning').length;
  const safeCount = enhancedSubjects.filter((s) => s.enhanced.status === 'safe').length;

  if (isLoading && !attendanceData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Welcome back, {name}!</h1>
          <p className="text-text-secondary mt-1">
            {lastUpdated ? `Last updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Loading...'}
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

      {/* Overall Stats Card */}
      {attendanceData && (
        <Card className="bg-gradient-primary text-white border-primary/30">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <CircularProgress
                percentage={attendanceData.overall_percentage}
                status={getAttendanceStatus(attendanceData.overall_percentage)}
                size={140}
              />
              <div>
                <h2 className="text-2xl font-bold mb-2">Overall Attendance</h2>
                <p className="text-white/80 text-sm">
                  {attendanceData.subjects.reduce((sum, s) => sum + s.attended_classes, 0)} /{' '}
                  {attendanceData.subjects.reduce((sum, s) => sum + s.total_classes, 0)} classes
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant={dangerCount > 0 ? 'danger' : 'safe'}>
                    {dangerCount} Critical
                  </Badge>
                  <Badge variant={warningCount > 0 ? 'warning' : 'safe'}>
                    {warningCount} Warning
                  </Badge>
                  <Badge variant="safe">{safeCount} Safe</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All Subjects', count: enhancedSubjects.length },
          { value: 'danger', label: 'Critical', count: dangerCount },
          { value: 'warning', label: 'Warning', count: warningCount },
          { value: 'safe', label: 'Safe', count: safeCount },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              filter === f.value
                ? 'bg-primary text-white shadow-glow'
                : 'bg-background-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Subjects Grid */}
      {error && (
        <Card className="border-status-danger bg-status-danger/5">
          <div className="flex items-center gap-3 text-status-danger">
            <AlertTriangle size={24} />
            <div>
              <h3 className="font-semibold">Error loading attendance</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {filteredSubjects.length === 0 ? (
        <Card>
          <p className="text-center text-text-secondary py-8">No subjects found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <motion.div
              key={subject.subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card
                hover
                onClick={() => navigate(`/subject/${subject.subject.id}`)}
                className="h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary mb-1">
                      {subject.subject.name}
                    </h3>
                    <p className="text-sm text-text-muted">{subject.subject.code}</p>
                  </div>
                  <Badge variant={subject.enhanced.status}>
                    {subject.enhanced.percentage.toFixed(1)}%
                  </Badge>
                </div>

                <LinearProgress
                  percentage={subject.enhanced.percentage}
                  status={subject.enhanced.status}
                  height={6}
                  className="mb-4"
                />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-text-muted">Attended</p>
                    <p className="font-semibold text-text-primary">
                      {subject.enhanced.attendedClasses} / {subject.enhanced.totalClasses}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">
                      {subject.enhanced.status === 'danger' ? 'Need to attend' : 'Can miss'}
                    </p>
                    <p className="font-semibold flex items-center gap-1">
                      {subject.enhanced.status === 'danger' ? (
                        <>
                          <TrendingUp size={14} className="text-status-danger" />
                          <span className="text-status-danger">{subject.enhanced.toAttend}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={14} className="text-status-safe" />
                          <span className="text-status-safe">{subject.enhanced.canMiss}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
