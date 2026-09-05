import React, { useState } from 'react';
import { BottomSheet } from '../bottom-sheet/BottomSheet';
import { authService } from '../../services/auth_service';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Reset Password">
      {sent ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            We have sent a password reset link to <strong>{email}</strong> if an account exists.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSent(false);
              onClose();
            }}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error" style={{ marginBottom: 'var(--space-3)' }}>{error}</div>}

          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
            Enter your account email address and we'll send you instructions to reset your password.
          </p>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      )}
    </BottomSheet>
  );
};
