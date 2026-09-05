import React, { useState } from 'react';
import { BottomSheet } from '../bottom-sheet/BottomSheet';
import type { ExpenseFormData } from '../../models/expense';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  expansionName?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  expansionName,
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        amount: numAmount,
        note: note.trim() || undefined,
      });
      setAmount('');
      setNote('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={expansionName ? `Add Expense · ${expansionName}` : 'Add Expense'}
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 'var(--space-3)' }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Amount ($)</label>
          <input
            type="number"
            step="any"
            min="0.01"
            className="form-input"
            placeholder="250.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            autoFocus
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Note / Description (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Logo design, Desk, Server hosting"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ marginTop: 'var(--space-6)' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Save Expense'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
