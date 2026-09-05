import React, { useState, useEffect } from 'react';
import type { Expansion, ExpansionStatus } from '../models/expansion';
import type { Expense, ExpenseFormData } from '../models/expense';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { expenseService } from '../services/expense_service';
import { ExpenseModal } from '../components/modals/ExpenseModal';
import { Plus, Trash2, ChevronDown, DollarSign } from 'lucide-react';

interface TrackTabProps {
  expansions: Expansion[];
  selectedExpansionId: string | null;
  onSelectExpansion: (id: string) => void;
  onUpdateProgress: (id: string, progress: number, status?: ExpansionStatus) => Promise<void>;
  onRefreshFinancials: () => void;
  onNavigateHome: () => void;
}

export const TrackTab: React.FC<TrackTabProps> = ({
  expansions,
  selectedExpansionId,
  onSelectExpansion,
  onUpdateProgress,
  onRefreshFinancials,
  onNavigateHome,
}) => {
  const [internalTab, setInternalTab] = useState<'progress' | 'expenses'>('progress');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [localProgress, setLocalProgress] = useState<number>(0);

  const currentExpansion = expansions.find((e) => e.id === selectedExpansionId) || expansions[0] || null;

  useEffect(() => {
    if (currentExpansion) {
      setLocalProgress(currentExpansion.progress);
    }
  }, [currentExpansion?.id, currentExpansion?.progress]);

  const loadExpenses = async (expId: string) => {
    try {
      setLoadingExpenses(true);
      const list = await expenseService.getExpenses(expId);
      setExpenses(list);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (currentExpansion) {
      loadExpenses(currentExpansion.id);
    }
  }, [currentExpansion?.id]);

  const handleSliderChange = (newVal: number) => {
    setLocalProgress(newVal);
  };

  const handleSliderCommit = async (newVal: number) => {
    if (!currentExpansion) return;
    try {
      setUpdatingProgress(true);
      let newStatus: ExpansionStatus | undefined = undefined;
      if (newVal === 100 && currentExpansion.status !== 'completed') {
        const markComplete = window.confirm('Progress reached 100%! Would you like to mark this Expansion as Completed?');
        if (markComplete) {
          newStatus = 'completed';
        }
      }
      await onUpdateProgress(currentExpansion.id, newVal, newStatus);
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleAddExpense = async (formData: ExpenseFormData) => {
    if (!currentExpansion) return;
    await expenseService.addExpense(currentExpansion.id, formData);
    await loadExpenses(currentExpansion.id);
    onRefreshFinancials();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!currentExpansion) return;
    if (window.confirm('Delete this expense?')) {
      await expenseService.deleteExpense(expenseId);
      await loadExpenses(currentExpansion.id);
      onRefreshFinancials();
    }
  };

  if (expansions.length === 0 || !currentExpansion) {
    return (
      <div className="ios-card empty-state" style={{ marginTop: 'var(--space-8)' }}>
        <p style={{ marginBottom: 'var(--space-4)' }}>No expansions available to track yet.</p>
        <button type="button" className="btn btn-primary" onClick={onNavigateHome}>
          Go to Home to Create One
        </button>
      </div>
    );
  }

  const { totalSpent, remainingBudget } = expenseService.calculateTotals(currentExpansion.budget, expenses);

  return (
    <div>
      {/* Top Expansion Selector */}
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label className="form-label">Active Expansion</label>
        <div style={{ position: 'relative' }}>
          <select
            className="form-select"
            value={currentExpansion.id}
            onChange={(e) => onSelectExpansion(e.target.value)}
            style={{ fontWeight: 600, paddingRight: '36px' }}
          >
            {expansions.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.name} ({exp.category})
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--color-text-secondary)',
            }}
          />
        </div>
      </div>

      {/* Internal Tab Switcher: Progress | Expenses */}
      <SegmentedControl
        options={[
          { label: 'Progress', value: 'progress' },
          { label: 'Expenses', value: 'expenses' },
        ]}
        value={internalTab}
        onChange={(val) => setInternalTab(val as 'progress' | 'expenses')}
      />

      {/* Progress Section */}
      {internalTab === 'progress' && (
        <div>
          <div className="ios-card">
            <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{currentExpansion.name}</h2>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                  <span className="badge badge-category">{currentExpansion.category}</span>
                  <span className={`badge badge-${currentExpansion.status}`}>{currentExpansion.status}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {localProgress}%
                </span>
              </div>
            </div>

            {/* Slider Control */}
            <div className="form-group" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <div className="flex-between" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                <span>Slide to adjust progress</span>
                {updatingProgress && <span>Saving...</span>}
              </div>
              <div className="ios-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={localProgress}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  onMouseUp={(e) => handleSliderCommit(Number((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => handleSliderCommit(Number((e.target as HTMLInputElement).value))}
                  className="ios-slider"
                />
              </div>
            </div>

            {/* Quick Progress Presets */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: 'var(--font-xs)',
                    fontWeight: 600,
                    backgroundColor: localProgress === pct ? 'var(--color-primary-subtle)' : undefined,
                    color: localProgress === pct ? 'var(--color-primary)' : undefined,
                  }}
                  onClick={() => {
                    handleSliderChange(pct);
                    handleSliderCommit(pct);
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Quick status summary info */}
          <div className="ios-card" style={{ marginTop: 'var(--space-3)' }}>
            <div className="flex-between" style={{ fontSize: 'var(--font-sm)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Status</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{currentExpansion.status}</span>
            </div>
            <div className="flex-between" style={{ fontSize: 'var(--font-sm)', marginTop: 'var(--space-2)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total Expenses Logged</span>
              <span style={{ fontWeight: 600 }}>{expenses.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Section */}
      {internalTab === 'expenses' && (
        <div>
          {/* Summary Metric Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">${Number(currentExpansion.budget).toLocaleString()}</div>
              <div className="stat-label">Budget</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: 'var(--color-text-primary)' }}>
                ${totalSpent.toLocaleString()}
              </div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-card">
              <div
                className="stat-number"
                style={{ color: remainingBudget < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}
              >
                ${remainingBudget.toLocaleString()}
              </div>
              <div className="stat-label">Remaining</div>
            </div>
          </div>

          {/* Add Expense Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsExpenseModalOpen(true)}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <Plus size={18} /> Add Expense
          </button>

          {/* Expense Items List */}
          {loadingExpenses ? (
            <div className="empty-state">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="ios-card empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
              <DollarSign size={36} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-2)' }} />
              <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>No Expenses Recorded</p>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                Add your purchases or investments into this expansion.
              </p>
            </div>
          ) : (
            <div>
              {expenses.map((item) => (
                <div key={item.id} className="ios-card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div className="flex-between">
                    <div>
                      <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 'var(--font-sm)', color: item.note ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {item.note || 'No note'}
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ color: 'var(--color-danger)', padding: '6px' }}
                      onClick={() => handleDeleteExpense(item.id)}
                      title="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expense Modal */}
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            onSubmit={handleAddExpense}
            expansionName={currentExpansion.name}
          />
        </div>
      )}
    </div>
  );
};
