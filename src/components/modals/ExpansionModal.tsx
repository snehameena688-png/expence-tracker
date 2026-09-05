import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../bottom-sheet/BottomSheet';
import type { Expansion, ExpansionFormData, ExpansionStatus } from '../../models/expansion';
import { Trash2 } from 'lucide-react';

interface ExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpansionFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: Expansion | null;
}

export const ExpansionModal: React.FC<ExpansionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
}) => {
  const isEditing = !!initialData;
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [status, setStatus] = useState<ExpansionStatus>('active');
  const [progress, setProgress] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setBudget(initialData.budget.toString());
      setStatus(initialData.status);
      setProgress(initialData.progress);
    } else {
      setName('');
      setCategory('Business');
      setBudget('');
      setStatus('active');
      setProgress(0);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an Expansion Name.');
      return;
    }
    const numBudget = parseFloat(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      setError('Please provide a valid non-negative Budget.');
      return;
    }
    if (progress < 0 || progress > 100) {
      setError('Progress must be between 0 and 100%.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        category: category.trim() || 'General',
        budget: numBudget,
        status,
        progress,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expansion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !onDelete) return;
    if (window.confirm(`Are you sure you want to delete "${initialData.name}" and all its expenses?`)) {
      try {
        setLoading(true);
        await onDelete(initialData.id);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to delete expansion');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Expansion' : 'New Expansion'}
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 'var(--space-3)' }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Expansion Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Launch Photography Business"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Business, Personal, Education, Home"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Budget ($)</label>
          <input
            type="number"
            step="any"
            min="0"
            className="form-input"
            placeholder="5000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as ExpansionStatus)}
            disabled={loading}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="form-group">
          <div className="flex-between" style={{ marginBottom: 'var(--space-1)' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Progress</label>
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{progress}%</span>
          </div>
          <div className="ios-slider-container">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="ios-slider"
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Expansion' : 'Create Expansion'}
          </button>
          {isEditing && onDelete && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDelete}
              disabled={loading}
              style={{ color: 'var(--color-danger)' }}
            >
              <Trash2 size={16} /> Delete Expansion
            </button>
          )}
        </div>
      </form>
    </BottomSheet>
  );
};
