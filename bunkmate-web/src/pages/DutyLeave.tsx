import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../state/toast';
import { useDutyLeaveStore } from '../state/dutyLeave';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Calendar, ClipboardList, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export const DutyLeave: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const {
    dutyLeaves,
    isLoading,
    error,
    fetchDutyLeaves,
    submitDutyLeave,
    approveDutyLeave,
    rejectDutyLeave,
    withdrawDutyLeave,
    statusCounts,
  } = useDutyLeaveStore();

  const [newLeave, setNewLeave] = useState({
    subject: '',
    type: 'duty',
    startDate: '',
    endDate: '',
    reason: '',
    supporting_doc: '',
  });

  const [formStep, setFormStep] = useState<'form' | 'preview' | 'success'>('form');

  const handleInputChange = (field: keyof typeof newLeave, value: string) => {
    setNewLeave(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep('preview');
  };

  const handleConfirmSubmit = async () => {
    try {
      await submitDutyLeave(newLeave);
      showToast({
        title: 'Success',
        message: 'Duty leave application submitted successfully!',
        type: 'success',
      });
      setFormStep('success');
      // Reset form after a short delay
      setTimeout(() => {
        setNewLeave({
          subject: '',
          type: 'duty',
          startDate: '',
          endDate: '',
          reason: '',
          supporting_doc: '',
        });
        setFormStep('form');
        // Refresh the duty leave list
        fetchDutyLeaves();
      }, 2000);
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to submit duty leave',
        type: 'error',
      });
      setFormStep('form');
    }
  };

  const handleBackToForm = () => {
    setFormStep('form');
  };

  if (isLoading && (!dutyLeaves || dutyLeaves.length === 0)) {
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
          <h1 className="text-2xl font-bold text-text-primary">Duty Leave Management</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => fetchDutyLeaves()}
              variant="secondary"
              isLoading={isLoading}
            >
              <TrendingUp size={20} /> Refresh
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['withdrawn', 'Withdrawn']].map(
            ([status, label]) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: status === 'pending' ? 0.1 : status === 'approved' ? 0.2 : status === 'rejected' ? 0.3 : 0.4 }}
              >
                <Card className="text-center py-4 border-border hover:shadow-md transition-shadow">
                  <Badge
                    variant={
                      status === 'pending'
                        ? 'warning'
                        : status === 'approved'
                          ? 'safe'
                          : status === 'rejected'
                            ? 'danger'
                            : 'text-muted'
                    }
                    className="mb-2"
                  >
                    {label}
                  </Badge>
                  <p className="text-2xl font-bold text-text-primary">{statusCounts[status] || 0}</p>
                </Card>
              </motion.div>
            )
          )}
        </div>

        {/* New Duty Leave Form */}
        {formStep === 'form' && (
          <Card className="border-t-4 border-primary">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-text-primary mb-4">New Duty Leave Application</h2>
              <p className="text-text-secondary">
                Apply for duty leave or other types of leave
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="text"
                  label="Subject"
                  placeholder="Enter subject name (e.g., Mathematics, Physics)"
                  value={newLeave.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  required
                  icon={<ClipboardList size={20} />}
                />
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Leave Type</label>
                  <div className="relative">
                    <ClipboardList size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <select
                      value={newLeave.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full p-3 pl-10 border border-border rounded-xl bg-background text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    >
                      <option value="">Select leave type</option>
                      <option value="duty">Duty Leave</option>
                      <option value="medical">Medical Leave</option>
                      <option value="personal">Personal Leave</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <Input
                  type="date"
                  label="Start Date"
                  placeholder="Select start date"
                  value={newLeave.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  icon={<Calendar size={20} />}
                />
                <Input
                  type="date"
                  label="End Date"
                  placeholder="Select end date"
                  value={newLeave.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                  icon={<Calendar size={20} />}
                />
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Reason</label>
                  <textarea
                    value={newLeave.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    placeholder="Enter reason for leave"
                    rows={4}
                    className="w-full p-3 border border-border rounded-xl bg-background text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                    required
                  />
                </div>
                <Input
                  type="text"
                  label="Supporting Document (Optional)"
                  placeholder="Enter document ID or description"
                  value={newLeave.supporting_doc}
                  onChange={(e) => handleInputChange('supporting_doc', e.target.value)}
                  icon={<CheckCircle size={20} />}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBackToForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Preview Application
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Preview Step */}
        {formStep === 'preview' && (
          <Card className="border-t-4 border-primary">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-text-primary mb-4">Preview Duty Leave Application</h2>
              <p className="text-text-secondary">
                Review your application before submitting
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ClipboardList size={20} className="text-text-muted" />
                  <div>
                    <p className="text-text-muted text-sm">Subject</p>
                    <p className="font-medium text-text-primary">{newLeave.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardList size={20} className="text-text-muted" />
                  <div>
                    <p className="text-text-muted text-sm">Leave Type</p>
                    <p className="font-medium text-text-primary">
                      {newLeave.type.charAt(0).toUpperCase() + newLeave.type.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-text-muted" />
                  <div>
                    <p className="text-text-muted text-sm">Start Date</p>
                    <p className="font-medium text-text-primary">
                      {newLeave.startDate ? new Date(newLeave.startDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-text-muted" />
                  <div>
                    <p className="text-text-muted text-sm">End Date</p>
                    <p className="font-medium text-text-primary">
                      {newLeave.endDate ? new Date(newLeave.endDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className="text-text-muted" />
                  <div>
                    <p className="text-text-muted text-sm">Reason</p>
                    <p className="text-text-primary">{newLeave.reason}</p>
                  </div>
                </div>
                {newLeave.supporting_doc && (
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-text-muted" />
                    <div>
                      <p className="text-text-muted text-sm">Supporting Document</p>
                      <p className="font-medium text-text-primary">{newLeave.supporting_doc}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackToForm}
                >
                  Edit Application
                </Button>
                <Button type="submit" onClick={handleConfirmSubmit} className="flex-1">
                  Submit Application
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Success Step */}
        {formStep === 'success' && (
          <Card className="text-center py-12 border-t-4 border-primary">
            <CheckCircle size={48} className="mx-auto text-success mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Application Submitted Successfully!
            </h2>
            <p className="text-text-secondary">
              Your duty leave application has been submitted for approval.
            </p>
            <Button
              onClick={() => {
                setFormStep('form');
                fetchDutyLeaves();
              }}
              variant="secondary"
            >
              Submit Another
            </Button>
          </Card>
        )}

        {/* Duty Leave List */}
        {formStep === 'form' && (
          <Card className="border-t-4 border-primary">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-text-primary mb-4">My Duty Leave Applications</h2>
              <p className="text-text-secondary text-sm mt-1">
                Track the status of your submitted applications
              </p>

              {error && (
                <div className="bg-status-danger/5 border border-status-danger/20 p-4 rounded-lg">
                  <AlertTriangle size={20} className="text-status-danger mr-3" />
                  <span className="text-status-danger">{error}</span>
                </div>
              )}

              {dutyLeaves && dutyLeaves.length > 0 ? (
                <div className="space-y-4">
                  {dutyLeaves.map((leave, index) => (
                    <motion.div
                      key={leave.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-border hover:shadow-md transition-shadow">
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-text-primary">
                                {leave.subject}
                              </h3>
                              <p className="text-text-muted text-sm">
                                {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave
                              </p>
                            </div>
                            <Badge
                              variant={
                                leave.status === 'pending'
                                  ? 'warning'
                                  : leave.status === 'approved'
                                    ? 'safe'
                                    : leave.status === 'rejected'
                                      ? 'danger'
                                      : 'text-muted'
                              }
                            >
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-border">
                            <div>
                              <p className="text-text-muted text-sm">Start Date</p>
                              <p className="font-medium text-text-primary">
                                {new Date(leave.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-text-muted text-sm">End Date</p>
                              <p className="font-medium text-text-primary">
                                {new Date(leave.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-text-muted text-sm">Applied On</p>
                              {new Date(leave.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          {leave.reason && (
                            <div className="mt-3 p-3 bg-background rounded-xl">
                              <p className="text-text-muted text-sm font-medium">Reason:</p>
                              <p className="text-text-primary">{leave.reason}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <ClipboardList size={32} className="mx-auto text-text-muted mb-3" />
                  <p className="text-text-secondary">No duty leave applications found</p>
                </Card>
              )}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};