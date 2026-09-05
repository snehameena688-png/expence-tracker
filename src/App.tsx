import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthScreen } from './app/AuthScreen';
import { MainScreen } from './app/MainScreen';
import { ChangePasswordModal } from './components/modals/ChangePasswordModal';
import { Layers } from 'lucide-react';

const RootContent: React.FC = () => {
  const { user, loading, isPasswordRecovery, clearPasswordRecovery } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-primary)',
        }}
      >
        <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
          <Layers size={48} strokeWidth={2} />
        </div>
        <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
          Loading Expansion Tracker...
        </p>
      </div>
    );
  }

  return (
    <>
      {user ? <MainScreen /> : <AuthScreen />}
      <ChangePasswordModal
        isOpen={isPasswordRecovery}
        onClose={clearPasswordRecovery}
      />
    </>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
