import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAssignmentStore } from '../state/assignments';
import { useToastStore } from '../state/toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { AssignmentData } from '../types/assignments';
import { ArrowLeft, Calendar, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export const AssignmentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId, assignmentId } = useParams();
  const { showToast } = useToastStore();
  const { assignments, isLoading, fetchAssignmentQuestions, submitAnswer } = useAssignmentStore();

  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!subjectId || !assignmentId) {
      navigate('/assignments');
      return;
    }

    const subjectAssignments = assignments.get(subjectId) || [];
    const found = subjectAssignments.find(a => a.assignmentId === assignmentId);
    if (found) {
      setAssignment(found);
    } else {
      navigate('/assignments');
    }
  }, [subjectId, assignmentId, assignments, navigate]);

  useEffect(() => {
    if (assignment) {
      const loadQuestions = async () => {
        try {
          const q = await fetchAssignmentQuestions(assignment.assignmentId);
          setQuestions(q);
        } catch (error: any) {
          showToast({
            title: 'Error',
            message: error.message || 'Failed to load questions',
            type: 'error',
          });
        }
      };
      loadQuestions();
    }
  }, [assignment, fetchAssignmentQuestions, showToast]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    setSubmitting(true);
    try {
      await submitAnswer(assignment.assignmentId, answers);
      setSubmitted(true);
      showToast({
        title: 'Success',
        message: 'Assignment submitted successfully!',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Failed to submit',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isPastDue = new Date(assignment.due_date) < new Date();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/assignments')}
        className="mb-4"
      >
        <ArrowLeft size={18} /> Back to Assignments
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Assignment Header */}
        <Card className="border-t-4 border-primary">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  {assignment.assignmentName}
                </h1>
                <p className="text-text-secondary">
                  {assignment.activity_type} Assignment
                </p>
              </div>
              <Badge variant={isPastDue ? 'danger' : 'warning'}>
                {isPastDue ? 'Past Due' : 'Pending'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-text-muted" />
                <div>
                  <p className="text-text-muted text-sm">Due Date</p>
                  <p className="font-medium text-text-primary">
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-text-muted" />
                <div>
                  <p className="text-text-muted text-sm">Due Time</p>
                  <p className="font-medium text-text-primary">
                    {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-text-muted" />
                <div>
                  <p className="text-text-muted text-sm">Questions</p>
                  <p className="font-medium text-text-primary">{questions.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-text-muted" />
                <div>
                  <p className="text-text-muted text-sm">Status</p>
                  <p className="font-medium text-text-primary">
                    {submitted ? 'Submitted' : 'Not Submitted'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Questions */}
        {questions.length > 0 ? (
          <Card className="space-y-4">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-text-primary">Questions</h2>
              <p className="text-text-secondary text-sm mt-1">
                Answer all questions and submit when ready
              </p>
            </div>

            <div className="p-6 space-y-6">
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary">{question.question_text}</h3>
                        {question.question_type && (
                          <Badge variant="info" className="mt-1 text-xs">
                            {question.question_type}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="ml-11">
                      {question.question_type === 'objective' || question.question_type === 'multiple_choice' ? (
                        <div className="space-y-2">
                          {question.options?.map((option: string, optIndex: number) => (
                            <label
                              key={optIndex}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                answers[question.id] === option
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={() => handleAnswerChange(question.id, option)}
                                className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary/20"
                              />
                              <span className="text-text-primary">{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          placeholder="Type your answer here..."
                          rows={4}
                          className="w-full p-4 border border-border rounded-xl bg-background text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {submitted ? (
              <div className="p-6 bg-status-safe/5 border-t border-status-safe/20 flex items-center gap-3">
                <CheckCircle size={24} className="text-status-safe" />
                <p className="text-status-safe font-medium">Assignment submitted successfully!</p>
              </div>
            ) : (
              <div className="p-6 border-t border-border">
                <Button
                  onClick={handleSubmit}
                  isLoading={submitting}
                  className="w-full"
                  disabled={submitted}
                >
                  Submit Assignment
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Card className="text-center py-12">
            <FileText size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-text-primary font-semibold mb-2">No Questions Available</h3>
            <p className="text-text-secondary">This assignment doesn't have any questions yet.</p>
          </Card>
        )}
      </motion.div>
    </div>
  );
};