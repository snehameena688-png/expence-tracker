import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { HomeTab } from '../tabs/HomeTab';
import { TrackTab } from '../tabs/TrackTab';
import { ProfileTab } from '../tabs/ProfileTab';
import type { Expansion, ExpansionFormData, ExpansionStatus } from '../models/expansion';
import { expansionService } from '../services/expansion_service';
import { expenseService } from '../services/expense_service';
import { Home, Compass, User as UserIcon } from 'lucide-react';

type MainTab = 'home' | 'track' | 'profile';

export const MainScreen: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [selectedExpansionId, setSelectedExpansionId] = useState<string | null>(null);
  const [expensesByExpansion, setExpensesByExpansion] = useState<
    Record<string, { totalSpent: number; remainingBudget: number }>
  >({});
  const [loading, setLoading] = useState(true);

  // Load all expansions & financial summaries
  const loadExpansions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const list = await expansionService.getExpansions(user.id);
      setExpansions(list);

      if (list.length > 0 && !selectedExpansionId) {
        setSelectedExpansionId(list[0].id);
      }

      // Compute financials for each expansion
      const financialMap: Record<string, { totalSpent: number; remainingBudget: number }> = {};
      await Promise.all(
        list.map(async (exp) => {
          try {
            const expExpenses = await expenseService.getExpenses(exp.id);
            financialMap[exp.id] = expenseService.calculateTotals(exp.budget, expExpenses);
          } catch (e) {
            financialMap[exp.id] = { totalSpent: 0, remainingBudget: exp.budget };
          }
        })
      );
      setExpensesByExpansion(financialMap);
    } catch (err) {
      console.error('Failed to load expansions:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedExpansionId]);

  useEffect(() => {
    loadExpansions();
  }, [user]);

  // Refresh single financial summary
  const handleRefreshFinancials = async () => {
    if (!selectedExpansionId) return;
    try {
      const exp = expansions.find((e) => e.id === selectedExpansionId);
      if (exp) {
        const expExpenses = await expenseService.getExpenses(exp.id);
        const totals = expenseService.calculateTotals(exp.budget, expExpenses);
        setExpensesByExpansion((prev) => ({
          ...prev,
          [exp.id]: totals,
        }));
      }
    } catch (e) {
      console.error('Failed to refresh financials', e);
    }
  };

  const handleCreateExpansion = async (formData: ExpansionFormData) => {
    if (!user) return;
    const created = await expansionService.createExpansion(user.id, formData);
    setSelectedExpansionId(created.id);
    await loadExpansions();
  };

  const handleUpdateExpansion = async (id: string, formData: ExpansionFormData) => {
    await expansionService.updateExpansion(id, formData);
    await loadExpansions();
  };

  const handleDeleteExpansion = async (id: string) => {
    await expansionService.deleteExpansion(id);
    if (selectedExpansionId === id) {
      setSelectedExpansionId(null);
    }
    await loadExpansions();
  };

  const handleUpdateProgress = async (id: string, progress: number, status?: ExpansionStatus) => {
    const updated = await expansionService.updateProgress(id, progress, status);
    setExpansions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, progress: updated.progress, status: updated.status } : e))
    );
  };

  const handleSelectExpansionForTrack = (id: string) => {
    setSelectedExpansionId(id);
    setActiveTab('track');
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Expansion Tracker';
      case 'track':
        return 'Track Progress';
      case 'profile':
        return 'Profile & Settings';
    }
  };

  return (
    <div className="app-container">
      {/* App Bar */}
      <header className="app-bar">
        <span className="app-bar-title">{getHeaderTitle()}</span>
      </header>

      {/* Content Area */}
      <main className="app-content">
        {activeTab === 'home' && (
          <HomeTab
            profile={profile}
            expansions={expansions}
            expensesByExpansion={expensesByExpansion}
            onSelectExpansionForTrack={handleSelectExpansionForTrack}
            onCreateExpansion={handleCreateExpansion}
            onUpdateExpansion={handleUpdateExpansion}
            onDeleteExpansion={handleDeleteExpansion}
            loading={loading}
          />
        )}

        {activeTab === 'track' && (
          <TrackTab
            expansions={expansions}
            selectedExpansionId={selectedExpansionId}
            onSelectExpansion={(id) => setSelectedExpansionId(id)}
            onUpdateProgress={handleUpdateProgress}
            onRefreshFinancials={handleRefreshFinancials}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <nav className="bottom-nav-bar" role="navigation" aria-label="Bottom Navigation">
        <button
          type="button"
          className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          aria-label="Home Tab"
        >
          <Home className="bottom-nav-icon" />
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`bottom-nav-item ${activeTab === 'track' ? 'active' : ''}`}
          onClick={() => setActiveTab('track')}
          aria-label="Track Tab"
        >
          <Compass className="bottom-nav-icon" />
          <span>Track</span>
        </button>

        <button
          type="button"
          className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          aria-label="Profile Tab"
        >
          <UserIcon className="bottom-nav-icon" />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
};
