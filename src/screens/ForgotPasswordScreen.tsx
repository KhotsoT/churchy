import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import './ForgotPasswordScreen.css';

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // TODO: Implement password reset
    setTimeout(() => {
      setMessage('Password reset link sent to your email');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="forgot-password-screen">
      <div className="forgot-password-container">
        <h1 className="forgot-password-title">Reset Password</h1>
        <p className="forgot-password-subtitle">Enter your email to receive a reset link</p>

        <Card className="forgot-password-card">
          {message && <div className="success-message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />

            <Button
              type="submit"
              variant="contained"
              loading={loading}
              disabled={loading || !email}
              className="reset-button"
            >
              Send Reset Link
            </Button>
          </form>

          <Link to="/login" className="back-link">
            Back to Login
          </Link>
        </Card>
      </div>
    </div>
  );
}
