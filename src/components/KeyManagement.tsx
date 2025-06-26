import React, { useState } from 'react';
import { Plus, Key, Download, Copy, Check, Trash2, Eye, EyeOff } from 'lucide-react';
import { AppState, KeyPair } from '../types';
import { CryptoUtils } from '../utils/crypto';

interface KeyManagementProps {
  appState: AppState;
  masterPassword: string;
  onStateChange: (newState: AppState) => void;
}

export const KeyManagement: React.FC<KeyManagementProps> = ({
  appState,
  masterPassword,
  onStateChange,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [exportPassword, setExportPassword] = useState('');

  const generateKeyPair = async () => {
    if (!newKeyName.trim()) return;

    setIsGenerating(true);
    try {
      const { publicKey, privateKey } = await CryptoUtils.generateKeyPair();
      const encryptedPrivateKey = await CryptoUtils.encryptPrivateKey(privateKey, masterPassword);
      
      const newKeyPair: KeyPair = {
        id: crypto.randomUUID(),
        name: newKeyName.trim(),
        publicKey,
        privateKey: encryptedPrivateKey,
        isActive: appState.keyPairs.length === 0, // First key is active by default
        createdAt: Date.now(),
      };

      // Deactivate other keys if this is set as active
      const updatedKeyPairs = appState.keyPairs.map(kp => ({
        ...kp,
        isActive: false,
      }));

      const newState = {
        ...appState,
        keyPairs: [...updatedKeyPairs, newKeyPair],
        publicKeys: [
          ...appState.publicKeys,
          {
            id: newKeyPair.id,
            name: `我的密钥: ${newKeyPair.name}`,
            publicKey: newKeyPair.publicKey,
          },
        ],
      };

      onStateChange(newState);
      setNewKeyName('');
      setShowNameInput(false);
    } catch (error) {
      console.error('Failed to generate key pair:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const setActiveKey = (id: string) => {
    const newState = {
      ...appState,
      keyPairs: appState.keyPairs.map(kp => ({
        ...kp,
        isActive: kp.id === id,
      })),
    };
    onStateChange(newState);
  };

  const deleteKeyPair = (id: string) => {
    if (confirm('确定要删除这个密钥对吗？此操作不可撤销！')) {
      const newState = {
        ...appState,
        keyPairs: appState.keyPairs.filter(kp => kp.id !== id),
        publicKeys: appState.publicKeys.filter(pk => pk.id !== id),
      };
      onStateChange(newState);
    }
  };

  const copyPublicKey = async (publicKey: string, id: string) => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy public key:', error);
    }
  };

  const exportPrivateKey = async (keyPair: KeyPair) => {
    if (exportPassword !== masterPassword) {
      alert('管理密码错误！');
      return;
    }

    try {
      const decryptedPrivateKey = await CryptoUtils.decryptPrivateKey(keyPair.privateKey, masterPassword);
      
      const exportData = {
        name: keyPair.name,
        publicKey: keyPair.publicKey,
        privateKey: decryptedPrivateKey,
        createdAt: keyPair.createdAt,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `private-key-${keyPair.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportingId(null);
      setExportPassword('');
    } catch (error) {
      console.error('Failed to export private key:', error);
      alert('导出失败！');
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate New Key Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">生成新密钥对</h2>
        
        {!showNameInput ? (
          <button
            onClick={() => setShowNameInput(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={18} />
            <span>生成新密钥对</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="输入密钥名称"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && generateKeyPair()}
            />
            <button
              onClick={generateKeyPair}
              disabled={isGenerating || !newKeyName.trim()}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isGenerating ? '生成中...' : '生成'}
            </button>
            <button
              onClick={() => {
                setShowNameInput(false);
                setNewKeyName('');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {/* Key Pairs List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">我的密钥对</h2>
        
        {appState.keyPairs.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">还没有生成任何密钥对</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.keyPairs.map((keyPair) => (
              <div
                key={keyPair.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  keyPair.isActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${keyPair.isActive ? 'bg-blue-500' : 'bg-gray-500'}`} />
                    <h3 className="font-semibold text-white">{keyPair.name}</h3>
                    {keyPair.isActive && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">活跃</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {!keyPair.isActive && (
                      <button
                        onClick={() => setActiveKey(keyPair.id)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        设为活跃
                      </button>
                    )}
                    <button
                      onClick={() => deleteKeyPair(keyPair.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-300 mb-3">
                  创建时间: {new Date(keyPair.createdAt).toLocaleString()}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => copyPublicKey(keyPair.publicKey, keyPair.id)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {copiedId === keyPair.id ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedId === keyPair.id ? '已复制' : '复制公钥'}</span>
                  </button>
                  
                  <button
                    onClick={() => setExportingId(keyPair.id)}
                    className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Download size={16} />
                    <span>导出私钥</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Private Key Modal */}
      {exportingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">导出私钥</h3>
            <p className="text-gray-300 mb-4">请输入管理密码以确认导出操作：</p>
            
            <div className="mb-4">
              <div className="relative">
                <input
                  type={showExportPassword ? 'text' : 'password'}
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  placeholder="输入管理密码"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowExportPassword(!showExportPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showExportPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const keyPair = appState.keyPairs.find(kp => kp.id === exportingId);
                  if (keyPair) exportPrivateKey(keyPair);
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 rounded-xl transition-all duration-200"
              >
                确认导出
              </button>
              <button
                onClick={() => {
                  setExportingId(null);
                  setExportPassword('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-xl transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};