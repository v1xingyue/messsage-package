import React, { useState } from 'react';
import { KeyManagement } from './KeyManagement';
import { MessageEncryption } from './MessageEncryption';
import { MessageDecryption } from './MessageDecryption';
import { PublicKeyManager } from './PublicKeyManager';
import { WalletConnection } from './WalletConnection';
import { Key, Lock, Unlock, Users, LogOut } from 'lucide-react';
import { AppState } from '../types';

interface MainAppProps {
  appState: AppState;
  masterPassword: string;
  onStateChange: (newState: AppState) => void;
  onLogout: () => void;
}

type Tab = 'keys' | 'encrypt' | 'decrypt' | 'contacts';

export const MainApp: React.FC<MainAppProps> = ({
  appState,
  masterPassword,
  onStateChange,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('keys');

  const tabs = [
    { id: 'keys' as Tab, label: '密钥管理', icon: Key },
    { id: 'encrypt' as Tab, label: '加密消息', icon: Lock },
    { id: 'decrypt' as Tab, label: '解密消息', icon: Unlock },
    { id: 'contacts' as Tab, label: '公钥列表', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">匿名消息工具</h1>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnection />
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut size={18} />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-2xl p-1 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'keys' && (
            <KeyManagement
              appState={appState}
              masterPassword={masterPassword}
              onStateChange={onStateChange}
            />
          )}
          {activeTab === 'encrypt' && (
            <MessageEncryption appState={appState} />
          )}
          {activeTab === 'decrypt' && (
            <MessageDecryption
              appState={appState}
              masterPassword={masterPassword}
            />
          )}
          {activeTab === 'contacts' && (
            <PublicKeyManager
              appState={appState}
              onStateChange={onStateChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};