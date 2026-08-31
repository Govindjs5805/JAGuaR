import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../state/toast';
import { useAttendanceStore } from '../state/attendance';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import {
  calculateEnhancedAttendanceStats,
  calculateEnhancedClassesCanMiss,
  calculateEnhancedClassesToAttend,
  getAttendanceStatus,
} from '../utils/helpers';
import { Calendar, Printer, FileText, AlertTriangle, CheckCircle, ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';

export const AbsenteeReport: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const {
    data: attendanceData,
    courseSchedule,
    isLoading,
    error,
    initFetchAttendance,
  } = useAttendanceStore();

  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    initFetchAttendance();
  }, []);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    initFetchAttendance();
  }, []);

  const handleGenerateReport = async () => {
    if (!attendanceData || !courseSchedule) {
      showToast({
        title: 'Error',
        message: 'Attendance data not available',
        type: 'error',
      });
      return;
    }

    try {
      // Process attendance data for report
      const report = {
        studentInfo: {
          name: 'Student', // In a real app, this would come from auth
          generatedAt: new Date().toLocaleString(),
        },
        summary: {
          overallPercentage: attendanceData.overall_percentage,
          totalClasses: attendanceData.subjects.reduce((sum, s) => sum + s.total_classes, 0),
          attendedClasses: attendanceData.subjects.reduce((sum, s) => sum + s.attended_classes, 0),
          absentClasses: attendanceData.subjects.reduce((sum, s) => sum + (s.total_classes - s.attended_classes), 0),
        },
        subjects: attendanceData.subjects.map((subject) => {
          const userRecords = courseSchedule?.get(subject.subject.id.toString()) || [];
          const stats = calculateEnhancedAttendanceStats(subject, userRecords);
          const canMiss = calculateEnhancedClassesCanMiss(stats);
          const toAttend = calculateEnhancedClassesToAttend(stats);

          return {
            subjectInfo: {
              name: subject.subject.name,
              code: subject.subject.code,
            },
            attendance: {
              percentage: stats.percentage,
              attended: stats.attendedClasses,
              total: stats.totalClasses,
              absent: stats.totalClasses - stats.attendedClasses,
            },
            status: getAttendanceStatus(stats.percentage),
            canMiss,
            toAttend,
          };
        }),
      };

      setReportData(report);
      setReportGenerated(true);

      showToast({
        title: 'Success',
        message: 'Absentee report generated successfully!',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to generate report',
        type: 'error',
      });
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    showToast({
      title: 'Info',
      message: 'PDF download functionality would be implemented here',
      type: 'info',
    });
  };

  if (isLoading && !attendanceData) {
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
          <h1 className="text-2xl font-bold text-text-primary">Absentee Report</h1>
          <div className="flex gap-3">
            <Button onClick={handlePrintReport} variant="secondary">
              <Printer size={20} /> Print Report
            </Button>
            <Button onClick={handleDownloadPDF} variant="secondary">
              <FileText size={20} /> Download PDF
            </Button>
          </div>
        </div>

        {/* Report Controls */}
        {!reportGenerated && (
          <Card className="border-t-4 border-primary">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-text-primary">Generate Absentee Report</h2>
              <p className="text-text-secondary">
                Generate a detailed report of your attendance and absentee records
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-text-muted" />
                  <div>
                    <p className="text-text-muted text-sm">Start Date</p>
                    <Input
                      type="date"
                      placeholder="Select start date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-text-muted" />
                  <div>
                    <p className="text-text-muted text-sm">End Date</p>
                    <Input
                      type="date"
                      placeholder="Select end date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  className="w-full"
                  isLoading={isLoading}
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Report Display */}
        {reportGenerated && reportData && (
          <>
            <Card className="border-t-4 border-primary">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-text-primary">Attendance Summary</h2>
                <p className="text-text-secondary">
                  Overall attendance performance for the selected period
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-text-muted text-sm">Overall Attendance</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {reportData.summary.overallPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-text-muted text-sm">Total Classes</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {reportData.summary.totalClasses}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-text-muted text-sm">Attended</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {reportData.summary.attendedClasses}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-text-muted text-sm">Absent</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {reportData.summary.absentClasses}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-text-muted font-medium mb-2">Generated on:</p>
                  <p className="text-text-primary">{reportData.studentInfo.generatedAt}</p>
                </div>
              </div>
            </Card>

            <Card className="border-t-4 border-primary">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-text-primary">Subject-wise Breakdown</h2>
                <p className="text-text-secondary">
                  Detailed attendance for each subject
                </p>

                {reportData.subjects.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.subjects.map((subject: any, index: number) => (
                      <motion.div
                        key={subject.subjectInfo.code || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-border/50 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-text-primary">
                                {subject.subjectInfo.name}
                              </h3>
                              <p className="text-xs text-text-muted">{subject.subjectInfo.code}</p>
                            </div>
                            <Badge variant={subject.status}>
                              {subject.attendance.percentage.toFixed(1)}%
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-text-muted">Attended</p>
                              <p className="font-semibold text-text-primary">
                                {subject.attendance.attended} / {subject.attendance.total}
                              </p>
                            </div>
                            <div>
                              <p className="text-text-muted">
                                {subject.status === 'danger' ? 'Needs Attention' : 'Can Miss'}
                              </p>
                              <p className="font-semibold flex items-center gap-1">
                                {subject.status === 'danger' ? (
                                  <>
                                    <TrendingUp size={14} className="text-status-danger" />
                                    <span className="text-status-danger">{subject.toAttend}</span>
                                  </>
                                ) : (
                                  <>
                                    <TrendingDown size={14} className="text-status-safe" />
                                    <span className="text-status-safe">{subject.canMiss}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-text-muted py-8">No subject data available</p>
                )}
              </div>
            </Card>

            {/* Notes */}
            <Card className="border-t-4 border-primary">
              <div className="p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">Important Notes</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-warning mt-1" />
                    <div className="flex-1">
                      <p className="text-text-muted">
                        <strong>Attendance Percentage:</strong> Calculated based on total classes conducted vs attended.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-success mt-1" />
                    <div className="flex-1">
                      <p className="text-text-muted">
                        <strong>Can Miss:</strong> Number of additional classes you can miss while maintaining minimum attendance.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-danger mt-1" />
                    <div className="flex-1">
                      <p className="text-text-muted">
                        <strong>Needs Attention:</strong> Number of classes you need to attend to reach minimum attendance requirement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
};