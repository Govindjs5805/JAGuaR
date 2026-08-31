import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../state/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { useToastStore } from '../state/toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    lookupUsername,
    login,
    isLoading,
    isUsernameVerified,
    verifiedUsername,
    resetLoginFlow
  } = useAuthStore();
  const { showToast } = useToastStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'username' | 'password'>('username');

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast({
        title: 'Error',
        message: 'Please enter your username',
        type: 'error',
      });
      return;
    }

    try {
      await lookupUsername(username);
      setStep('password');
    } catch (error: any) {
      showToast({
        title: 'Error',
        message: error.message || 'Username not found',
        type: 'error',
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      showToast({
        title: 'Error',
        message: 'Please enter your password',
        type: 'error',
      });
      return;
    }

    try {
      await login({
        username: verifiedUsername || username,
        password,
        stay_logged_in: true,
      });
      showToast({
        title: 'Success',
        message: 'Login successful!',
        type: 'success',
      });
      navigate('/dashboard');
    } catch (error: any) {
      showToast({
        title: 'Login Failed',
        message: error.message || 'Invalid credentials',
        type: 'error',
      });
    }
  };

  const handleBack = () => {
    setStep('username');
    setPassword('');
    resetLoginFlow();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-surface to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold text-gradient mb-2"
          >
            BunkMate
          </motion.h1>
          <p className="text-text-secondary">Track your attendance, ace your exams</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-background-card border border-border rounded-2xl p-8 shadow-card"
        >
          {step === 'username' ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h2>
                <p className="text-text-secondary text-sm">Enter your username to continue</p>
              </div>

              <Input
                type="text"
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User size={20} />}
                disabled={isLoading}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Continue
                <ArrowRight size={20} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Enter Password</h2>
                <p className="text-text-secondary text-sm">
                  Logging in as <span className="text-primary font-semibold">{verifiedUsername}</span>
                </p>
              </div>

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={20} />}
                disabled={isLoading}
                autoFocus
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" isLoading={isLoading}>
                  Login
                </Button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-6">
          BunkMate © 2024 • Made with ❤️ for KTU Students
        </p>
      </motion.div>
    </div>
  );
};
