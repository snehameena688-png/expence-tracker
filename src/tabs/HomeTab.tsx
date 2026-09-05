import React, { useState } from 'react';
import type { Expansion, ExpansionFormData } from '../models/expansion';
import type { UserProfile } from '../models/user';
import { Plus, Target } from 'lucide-react';
import { ExpansionModal } from '../components/modals/ExpansionModal';

interface HomeTabProps {
  profile: UserProfile | null;
  expansions: Expansion[];
  expensesByExpansion: Record<string, { totalSpent: number; remainingBudget: number }>;
  onSelectExpansionForTrack: (id: string) => void;
  onCreateExpansion: (data: ExpansionFormData) => Promise<void>;
  onUpdateExpansion: (id: string, data: ExpansionFormData) => Promise<void>;
  onDeleteExpansion: (id: string) => Promise<void>;
  loading: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  profile,
  expansions,
  expensesByExpansion,
  onSelectExpansionForTrack,
  onCreateExpansion,
  onUpdateExpansion,
  onDeleteExpansion,
  loading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpansion, setEditingExpansion] = useState<Expansion | null>(null);

  const totalCount = expansions.length;
  const activeCount = expansions.filter((e) => e.status === 'active').length;
  const completedCount = expansions.filter((e) => e.status === 'completed').length;

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const handleOpenCreate = () => {
    setEditingExpansion(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, item: Expansion) => {
    e.stopPropagation();
    setEditingExpansion(item);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: ExpansionFormData) => {
    if (editingExpansion) {
      await onUpdateExpansion(editingExpansion.id, formData);
    } else {
      await onCreateExpansion(formData);
    }
  };

  return (
    <div>
      {/* Greeting Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Hello, {firstName}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', marginTop: '2px' }}>
          Keep building toward your goals.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{totalCount}</div>
          <div className="stat-label">Total Expansions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--color-success)' }}>{activeCount}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--color-primary)' }}>{completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-secondary)' }}>
          Your Expansions
        </span>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
          {totalCount} {totalCount === 1 ? 'goal' : 'goals'}
        </span>
      </div>

      {/* Expansion List */}
      {loading ? (
        <div className="empty-state">Loading expansions...</div>
      ) : expansions.length === 0 ? (
        <div className="ios-card empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
          <Target size={40} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-3)' }} />
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No Expansions Yet
          </h3>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
            Create your first expansion to track progress and budget in one place.
          </p>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate} style={{ maxWidth: '200px', margin: '0 auto' }}>
            <Plus size={18} /> Add Expansion
          </button>
        </div>
      ) : (
        <div>
          {expansions.map((item) => {
            const financial = expensesByExpansion[item.id] || { totalSpent: 0, remainingBudget: item.budget };
            return (
              <div
                key={item.id}
                className="ios-card ios-card-interactive"
                onClick={() => onSelectExpansionForTrack(item.id)}
              >
                <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {item.name}
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)', alignItems: 'center' }}>
                      <span className="badge badge-category">{item.category}</span>
                      <span className={`badge badge-${item.status}`}>{item.status}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(e, item)}
                    className="btn-ghost"
                    style={{ fontSize: 'var(--font-xs)', fontWeight: 600, padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
                  >
                    Edit
                  </button>
                </div>

                {/* Progress */}
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <div className="flex-between" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.progress}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>

                {/* Financial Summary */}
                <div
                  className="flex-between"
                  style={{
                    marginTop: 'var(--space-3)',
                    paddingTop: 'var(--space-2)',
                    borderTop: '1px solid var(--color-border-subtle)',
                    fontSize: 'var(--font-xs)',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Spent: </span>
                    <span style={{ fontWeight: 600 }}>${financial.totalSpent.toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Budget: </span>
                    <span style={{ fontWeight: 600 }}>${Number(item.budget).toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Remaining: </span>
                    <span style={{ fontWeight: 600, color: financial.remainingBudget < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      ${financial.remainingBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        className="fab-button"
        onClick={handleOpenCreate}
        aria-label="Add Expansion"
      >
        <Plus size={20} />
        <span>Add Expansion</span>
      </button>

      {/* Add / Edit Expansion Modal */}
      <ExpansionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={onDeleteExpansion}
        initialData={editingExpansion}
      />
    </div>
  );
};
