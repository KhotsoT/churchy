import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../utils/validation';
import { useAuthStore } from '../store/authStore';
import { RegisterData } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import * as yup from 'yup';
import './RegisterScreen.css';

const registerSchema = loginSchema.shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  churchName: yup.string().required('Church name is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const { register } = useAuthStore();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData & { confirmPassword: string }>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      churchName: '',
    },
  });

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    try {
      setError('');
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-screen">
      <div className="register-container">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Start managing your church</p>

        <Card className="register-card">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="churchName"
              render={({ field }) => (
                <Input
                  {...field}
                  label="Church Name"
                  error={errors.churchName?.message}
                  placeholder="Enter church name"
                />
              )}
            />

            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <Input
                  {...field}
                  label="First Name"
                  error={errors.firstName?.message}
                  placeholder="Enter first name"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <Input
                  {...field}
                  label="Last Name"
                  error={errors.lastName?.message}
                  placeholder="Enter last name"
                />
              )}
            />

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

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  label="Confirm Password"
                  error={errors.confirmPassword?.message}
                  placeholder="Confirm your password"
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              loading={isSubmitting}
              className="register-button"
            >
              Create Account
            </Button>
          </form>

          <div className="login-link">
            <span>Already have an account? </span>
            <Link to="/login">Sign In</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
