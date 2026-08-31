import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAssignmentStore } from '../state/assignments';
import { useToastStore } from '../state/toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { AssignmentData } from '../types/assignments';
import { Badge } from '../components/ui/Badge';
import { ClipboardList, Calendar, ArrowRight } from 'lucide-react';

export const Assignments: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { assignments, isLoading } = useAssignmentStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        await useAssignmentStore.getState().fetchAssignments();
      } catch (error: any) {
        showToast({
          title: 'Error',
          message: error.message || 'Failed to load assignments',
          type: 'error',
        });
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const assignmentMap = Array.from(assignments.entries());

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">My Assignments</h1>
        <Button onClick={() => navigate('/assignments/new')} variant="secondary">
          <Calendar size={20} /> New Assignment
        </Button>
      </div>

      {assignmentMap.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary">No assignments found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignmentMap.map(([subjectId, subjectAssignments]) => (
            <motion.div
              key={subjectId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-t-4 border-primary">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <ClipboardList size={24} className="text-primary" />
                    <h3 className="font-bold text-text-primary">Subject {subjectId}</h3>
                  </div>
                  <Badge variant="info">
                    {subjectAssignments.length} assignments
                  </Badge>
                </div>

                <div className="p-4 space-y-3">
                  {subjectAssignments.map((assignment: AssignmentData) => (
                    <motion.div
                      key={assignment.assignmentId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card
                        hover
                        onClick={() => navigate(`/assignments/${subjectId}/${assignment.assignmentId}`)}
                        className="border-border"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-text-primary">
                              {assignment.assignmentName}
                            </h4>
                            <p className="text-sm text-text-muted mt-1">
                              {assignment.activity_type} • {new Date(assignment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                          >
                            <ArrowRight size={18} />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};