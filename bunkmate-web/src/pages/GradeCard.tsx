import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../state/toast';
import { useKTUGradesStore } from '../state/ktuGrades';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { GradeDetails, GradeCardData } from '../types/gradeCard';
import { UserPlus, Calendar, TrendingUp, AlertTriangle, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const GradeCard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const {
    username,
    password,
    sessionValid,
    isLoading,
    error,
    gradeData,
    loginToKTU,
    fetchGrades,
    logout,
    resetLogin
  } = useKTUGradesStore();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput) {
      showToast({
        title: 'Error',
        message: 'Please enter both username and password',
        type: 'error',
      });
      return;
    }

    try {
      await loginToKTU(usernameInput, passwordInput);
      showToast({
        title: 'Success',
        message: 'KTU login successful!',
        type: 'success',
      });
      await fetchGrades();
    } catch (error: any) {
      showToast({
        title: 'Login Failed',
        message: error.message || 'Invalid KTU credentials',
        type: 'error',
      });
    }
  };

  const handleFetchGrades = async () => {
    try {
      await fetchGrades();
      showToast({
        title: 'Success',
        message: 'Grades refreshed successfully!',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to fetch grades',
        type: 'error',
      });
    }
  };

  const handleLogout = () => {
    logout();
    resetLogin();
    setUsernameInput('');
    setPasswordInput('');
    showToast({
      title: 'Logged Out',
      message: 'Successfully logged out from KTU portal',
      type: 'info',
    });
  };

  if (isLoading && (!gradeData || gradeData.length === 0)) {
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
        {/* KTU Login Section */}
        {!sessionValid && (
          <Card className="border-t-4 border-primary">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-text-primary">
                KTU Grade Card Login
              </h2>
              <p className="text-text-secondary">
                Login to your KTU student portal to view your grade cards
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="text"
                  label="KTU Username"
                  placeholder="Enter your KTU username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  icon={<UserPlus size={20} />}
                  disabled={isLoading}
                  autoFocus
                />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="KTU Password"
                  placeholder="Enter your KTU password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  icon={<Lock size={20} />}
                  disabled={isLoading}
                  endContent={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2"
                      title="Toggle password visibility"
                    >
                      {showPassword ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    </Button>
                  }
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Login to KTU
                </Button>
              </form>

              {error && (
                <div className="bg-status-danger/5 border border-status-danger/20 p-4 rounded-lg">
                  <AlertTriangle size={20} className="text-status-danger mr-3" />
                  <span className="text-status-danger">{error}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Grade Card Display */}
        {sessionValid && gradeData && gradeData.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">
                My Grade Cards
              </h2>
              <Button onClick={handleFetchGrades} variant="secondary" isLoading={isLoading}>
                <TrendingUp size={20} /> Refresh Grades
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradeData.map((semester: GradeCardData, index) => (
                <motion.div
                  key={semester.semester || `semester-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full border-t-4 border-primary hover:shadow-lg transition-shadow">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-text-primary">
                          Semester {semester.semester}
                        </h3>
                        <Badge variant="info" className="px-3 py-1">
                          {semester.subjects?.length || 0} Subjects
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <p className="text-text-secondary">
                          SGPA: <span className="font-semibold text-text-primary">{semester.sgpa || 'N/A'}</span>
                        </p>
                        {semester.cgpa && (
                          <p className="text-text-secondary">
                            CGPA: <span className="font-semibold text-text-primary">{semester.cgpa}</span>
                          </p>
                        )}
                      </div>

                      {semester.subjects && semester.subjects.length > 0 ? (
                        <div className="space-y-2">
                          {semester.subjects.map((subject: GradeDetails, subIndex: number) => (
                            <motion.div
                              key={subject.code || `subject-${subIndex}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: subIndex * 0.03 }}
                            >
                              <Card className="border-border/50 p-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-text-primary">{subject.name}</p>
                                    <p className="text-xs text-text-muted">{subject.code}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge
                                      variant={
                                        subject.grade === 'F' || subject.grade === 'FE'
                                          ? 'danger'
                                          : subject.grade === 'D' || subject.grade === 'E'
                                            ? 'warning'
                                            : 'safe'
                                      }
                                      className="text-xs px-2 py-1"
                                    >
                                      {subject.grade}
                                    </Badge>
                                    {subject.credits && (
                                      <p className="text-xs text-text-muted mt-1">
                                        {subject.credits} Credits
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-text-muted py-4">No subjects found</p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {sessionValid && (!gradeData || gradeData.length === 0) && (
          <Card className="text-center py-12">
            <TrendingUp size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-text-primary font-semibold mb-2">No Grade Data Available</h3>
            <p className="text-text-secondary">
              You haven't fetched your grades yet or there's no data available for the current session.
            </p>
            <Button onClick={handleFetchGrades} variant="secondary">
              Fetch Grades
            </Button>
          </Card>
        )}
      </motion.div>
    </div>
  );
};