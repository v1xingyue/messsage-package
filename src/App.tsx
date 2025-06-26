import React, { useState, useEffect } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AppState } from './types';
import { StorageUtils } from './utils/storage';
import { CryptoUtils } from './utils/crypto';

function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const state = StorageUtils.loadAppState();
    setAppState(state);
  }, []);

  const handleSetup = async (password: string) => {
    const passwordHash = await CryptoUtils.hashMasterPassword(password);
    const newState: AppState = {
      isSetup: true,
      masterPasswordHash: passwordHash,
      keyPairs: [],
      publicKeys: [],
    };
    
    setAppState(newState);
    StorageUtils.saveAppState(newState);
    setMasterPassword(password);
    setIsAuthenticated(true);
  };

  const handleLogin = async (password: string): Promise<boolean> => {
    if (!appState) return false;
    
    const passwordHash = await CryptoUtils.hashMasterPassword(password);
    const isValid = passwordHash === appState.masterPasswordHash;
    
    if (isValid) {
      setMasterPassword(password);
      setIsAuthenticated(true);
    }
    
    return isValid;
  };

  const handleStateChange = (newState: AppState) => {
    setAppState(newState);
    StorageUtils.saveAppState(newState);
  };

  const handleLogout = () => {
    setMasterPassword('');
    setIsAuthenticated(false);
  };

  if (!appState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!appState.isSetup) {
    return <SetupScreen onSetup={handleSetup} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <MainApp
      appState={appState}
      masterPassword={masterPassword}
      onStateChange={handleStateChange}
      onLogout={handleLogout}
    />
  );
}

export default App;