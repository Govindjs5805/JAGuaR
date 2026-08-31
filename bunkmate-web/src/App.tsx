import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './state/auth';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LoadingScreen } from './components/ui/Spinner';
import { Toast } from './components/ui/Toast';

// Lazy load pages for better performance
const Assignments = React.lazy(() => import('./pages/Assignments').then(m => ({ default: m.Assignments })));
const AssignmentDetails = React.lazy(() => import('./pages/AssignmentDetails').then(m => ({ default: m.AssignmentDetails })));
const GradeCard = React.lazy(() => import('./pages/GradeCard').then(m => ({ default: m.GradeCard })));
const DutyLeave = React.lazy(() => import('./pages/DutyLeave').then(m => ({ default: m.DutyLeave })));
const Surveys = React.lazy(() => import('./pages/Surveys').then(m => ({ default: m.Surveys })));
const AbsenteeReport = React.lazy(() => import('./pages/AbsenteeReport').then(m => ({ default: m.AbsenteeReport })));
const Notifications = React.lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const SubjectDetails = React.lazy(() => import('./pages/SubjectDetails').then(m => ({ default: m.SubjectDetails })));

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Wrapper (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="assignments"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <Assignments />
              </React.Suspense>
            }
          />
          <Route
            path="assignments/:id"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <AssignmentDetails />
              </React.Suspense>
            }
          />

          <Route
            path="subject/:id"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <SubjectDetails />
              </React.Suspense>
            }
          />

          <Route
            path="grade-card"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <GradeCard />
              </React.Suspense>
            }
          />

          <Route
            path="duty-leave"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <DutyLeave />
              </React.Suspense>
            }
          />

          <Route
            path="surveys"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <Surveys />
              </React.Suspense>
            }
          />

          <Route
            path="absentee-report"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <AbsenteeReport />
              </React.Suspense>
            }
          />

          <Route
            path="notifications"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <Notifications />
              </React.Suspense>
            }
          />

          <Route
            path="settings"
            element={
              <React.Suspense fallback={<LoadingScreen />}>
                <Settings />
              </React.Suspense>
            }
          />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
