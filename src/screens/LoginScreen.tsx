import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../utils/validation';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import './LoginScreen.css';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const { login } = useAuthStore();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setError('');
      await login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <h1 className="login-title">Church Manager</h1>
        <p className="login-subtitle">Sign in to continue</p>

        <Card className="login-card">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  label="Email"
                  error={errors.email?.message}
                  placeholder="Enter your email"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  label="Password"
                  error={errors.password?.message}
                  placeholder="Enter your password"
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              loading={isSubmitting}
              className="login-button"
            >
              Sign In
            </Button>
          </form>

          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>

          <div className="register-link">
            <span>Don't have an account? </span>
            <Link to="/register">Sign Up</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
