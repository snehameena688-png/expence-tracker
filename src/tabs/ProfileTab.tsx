import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth_service';
import { Palette, Key, LogOut, Check, Trash2 } from 'lucide-react';
import { CustomizationModal } from '../components/modals/CustomizationModal';
import { ChangePasswordModal } from '../components/modals/ChangePasswordModal';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const ProfileTab: React.FC = () => {
  const { user, profile, refreshProfile, signOut, deleteAccount } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  React.useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim()) return;

    try {
      setIsUpdatingName(true);
      setNameError(null);
      await authService.updateProfile(user.id, fullName.trim());
      await refreshProfile();
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err: any) {
      setNameError(err.message || 'Failed to update name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await deleteAccount();
    } catch (err: any) {
      alert('Failed to delete account: ' + err.message);
    } finally {
      setDeletingAccount(false);
      setIsDeleteAccountOpen(false);
    }
  };

  return (
    <div>
      {/* Profile Header */}
      <div className="ios-card" style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-3)',
            fontSize: 'var(--font-xl)',
            fontWeight: 700,
          }}
        >
          {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{profile?.full_name || 'User'}</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', marginTop: '2px' }}>
          {user?.email}
        </p>
      </div>

      {/* Editable Account Information */}
      <div className="ios-card">
        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}>
          Account Details
        </span>

        <form onSubmit={handleSaveName}>
          {nameError && <div className="form-error" style={{ marginBottom: 'var(--space-2)' }}>{nameError}</div>}
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isUpdatingName}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: 'auto', padding: '0 var(--space-4)', whiteSpace: 'nowrap' }}
                disabled={isUpdatingName || fullName === profile?.full_name}
              >
                {nameSaved ? <Check size={18} /> : isUpdatingName ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email (Read-Only)</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>
        </form>
      </div>

      {/* Preferences & Actions */}
      <div className="ios-card" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          type="button"
          className="btn-ghost flex-between"
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
            textAlign: 'left',
          }}
          onClick={() => setIsCustomizationOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Palette size={20} color="var(--color-primary)" />
            <span style={{ fontWeight: 500, fontSize: 'var(--font-md)' }}>Appearance & Theme</span>
          </div>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>Customize ›</span>
        </button>

        <button
          type="button"
          className="btn-ghost flex-between"
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
            textAlign: 'left',
          }}
          onClick={() => setIsPasswordModalOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Key size={20} color="var(--color-primary)" />
            <span style={{ fontWeight: 500, fontSize: 'var(--font-md)' }}>Change Password</span>
          </div>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>Update ›</span>
        </button>

        <button
          type="button"
          className="btn-ghost flex-between"
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
            textAlign: 'left',
          }}
          onClick={() => setIsLogoutConfirmOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <LogOut size={20} color="var(--color-text-secondary)" />
            <span style={{ fontWeight: 500, fontSize: 'var(--font-md)' }}>Sign Out</span>
          </div>
        </button>

        <button
          type="button"
          className="btn-ghost flex-between"
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            color: 'var(--color-danger)',
            textAlign: 'left',
          }}
          onClick={() => setIsDeleteAccountOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Trash2 size={20} color="var(--color-danger)" />
            <span style={{ fontWeight: 600, fontSize: 'var(--font-md)' }}>Delete Account</span>
          </div>
        </button>
      </div>

      {/* App Version Info */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-xs)' }}>
        <p>Expansion Tracker v1.0.0</p>
        <p style={{ marginTop: '2px' }}>Distraction-free goals and budget tracking</p>
      </div>

      {/* Modals */}
      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of Expansion Tracker?"
        confirmText="Sign Out"
        isDestructive={false}
        loading={loggingOut}
      />

      <ConfirmModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleConfirmDeleteAccount}
        title="Delete Your Account?"
        message="This action is permanent and cannot be undone. All your expansions, goals, and logged expenses will be permanently deleted."
        confirmText="Permanently Delete Account"
        isDestructive={true}
        loading={deletingAccount}
      />
    </div>
  );
};
