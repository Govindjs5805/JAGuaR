import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSurveysStore } from '../state/surveys';
import { useToastStore } from '../state/toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { SurveyData } from '../types/surveys';
import { ClipboardList, Calendar, AlertCircle, CheckCircle, TrendingUp, ArrowLeft } from 'lucide-react';

export const Surveys: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { surveys, isLoading, error, fetchSurveys, submitSurveyResponse } = useSurveysStore();

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        await fetchSurveys();
      } catch (error: any) {
        showToast({
          title: 'Error',
          message: error.message || 'Failed to load surveys',
          type: 'error',
        });
      }
    };
    loadSurveys();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingSurveys = surveys.filter(s => s.status === 'pending' || s.status === 'available');
  const completedSurveys = surveys.filter(s => s.status === 'completed' || s.status === 'submitted');
  const expiredSurveys = surveys.filter(s => s.status === 'expired');

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Surveys & Feedback</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => fetchSurveys()}
              variant="secondary"
              isLoading={isLoading}
            >
              <TrendingUp size={20} /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            key="pending"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center py-4 border-border hover:shadow-md transition-shadow">
              <Badge variant="warning" className="mb-2">
                Pending
              </Badge>
              <p className="text-2xl font-bold text-text-primary">{pendingSurveys.length}</p>
            </Card>
          </motion.div>
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center py-4 border-border hover:shadow-md transition-shadow">
              <Badge variant="safe" className="mb-2">
                Completed
              </Badge>
              <p className="text-2xl font-bold text-text-primary">{completedSurveys.length}</p>
            </Card>
          </motion.div>
          <motion.div
            key="expired"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center py-4 border-border hover:shadow-md transition-shadow">
              <Badge variant="danger" className="mb-2">
                Expired
              </Badge>
              <p className="text-2xl font-bold text-text-primary">{expiredSurveys.length}</p>
            </Card>
          </motion.div>
        </div>

        {/* Pending Surveys */}
        {pendingSurveys.length > 0 ? (
          <>
            <h2 className="text-xl font-bold text-text-primary mb-4">
              Available Surveys
            </h2>
            <div className="space-y-4">
              {pendingSurveys.map((survey: SurveyData) => (
                <motion.div
                  key={survey.surveyId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: survey.surveyId * 0.01 }}
                >
                  <Card className="border-t-4 border-primary hover:shadow-lg transition-shadow">
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-text-primary">
                            {survey.title}
                          </h3>
                          <p className="text-text-muted text-sm mt-1">
                            {survey.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="info">
                            {survey.questions?.length || 0} Questions
                          </Badge>
                          {survey.expires_at && (
                            <Badge
                              variant={
                                new Date(survey.expires_at) < new Date() ? 'danger' : 'warning'
                              }
                            >
                              Expires: {new Date(survey.expires_at).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-border">
                        <p className="text-text-secondary">
                          <strong>Created by:</strong> {survey.created_by || 'Anonymous'}
                        </p>
                        <p className="text-text-secondary">
                          <strong>Created on:</strong> {new Date(survey.created_at).toLocaleDateString()}
                        </p>
                        {survey.target_audience && (
                          <p className="text-text-secondary">
                            <strong>Target Audience:</strong> {survey.target_audience}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-border">
                        <Button
                          onClick={() => navigate(`/surveys/${survey.surveyId}`)}
                          variant="secondary"
                        >
                          Take Survey
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <Card className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-text-primary font-semibold mb-2">No Available Surveys</h3>
            <p className="text-text-secondary">
              Check back later for new surveys and feedback opportunities.
            </p>
          </Card>
        )}

        {/* Completed Surveys */}
        {completedSurveys.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-text-primary mb-4 mt-8">
              Completed Surveys
            </h2>
            <div className="space-y-4">
              {completedSurveys.map((survey: SurveyData) => (
                <motion.div
                  key={survey.surveyId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: survey.surveyId * 0.01 }}
                >
                  <Card className="border-t-4 border-success hover:shadow-lg transition-shadow">
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-text-primary">
                            {survey.title}
                          </h3>
                          <p className="text-text-muted text-sm mt-1">
                            {survey.description}
                          </p>
                        </div>
                        <Badge variant="safe">
                          Completed
                        </Badge>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-border">
                        <p className="text-text-secondary">
                          <strong>Submitted on:</strong> {new Date(survey.submitted_at || survey.updated_at).toLocaleDateString()}
                        </p>
                        {survey.feedback && (
                          <div className="mt-3">
                            <p className="text-text-muted text-sm font-medium">Your Feedback:</p>
                            <p className="text-text-primary">{survey.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Expired Surveys */}
        {expiredSurveys.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-text-primary mb-4 mt-8">
              Expired Surveys
            </h2>
            <div className="space-y-4">
              {expiredSurveys.map((survey: SurveyData) => (
                <motion.div
                  key={survey.surveyId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: survey.surveyId * 0.01 }}
                >
                  <Card className="border-t-4 border-danger/20 hover:shadow-lg transition-shadow">
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-text-primary">
                            {survey.title}
                          </h3>
                          <p className="text-text-muted text-sm mt-1">
                            {survey.description}
                          </p>
                        </div>
                        <Badge variant="danger">
                          Expired
                        </Badge>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-border">
                        <p className="text-text-secondary">
                          <strong>Expired on:</strong> {new Date(survey.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};