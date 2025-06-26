import React, { useState } from 'react';
import { Plus, Users, Copy, Check, Trash2, Edit3 } from 'lucide-react';
import { AppState, PublicKeyEntry } from '../types';

interface PublicKeyManagerProps {
  appState: AppState;
  onStateChange: (newState: AppState) => void;
}

export const PublicKeyManager: React.FC<PublicKeyManagerProps> = ({ 
  appState, 
  onStateChange 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newPublicKey, setNewPublicKey] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const addPublicKey = () => {
    if (!newKeyName.trim() || !newPublicKey.trim()) return;

    const newEntry: PublicKeyEntry = {
      id: crypto.randomUUID(),
      name: newKeyName.trim(),
      publicKey: newPublicKey.trim(),
    };

    const newState = {
      ...appState,
      publicKeys: [...appState.publicKeys, newEntry],
    };

    onStateChange(newState);
    setNewKeyName('');
    setNewPublicKey('');
    setShowAddForm(false);
  };

  const deletePublicKey = (id: string) => {
    // Don't delete own public keys
    const isOwnKey = appState.keyPairs.some(kp => kp.id === id);
    if (isOwnKey) {
      alert('无法删除自己的公钥！请在密钥管理中删除对应的密钥对。');
      return;
    }

    if (confirm('确定要删除这个公钥吗？')) {
      const newState = {
        ...appState,
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

  const startEdit = (entry: PublicKeyEntry) => {
    setEditingId(entry.id);
    setEditName(entry.name);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;

    const newState = {
      ...appState,
      publicKeys: appState.publicKeys.map(pk => 
        pk.id === id ? { ...pk, name: editName.trim() } : pk
      ),
    };

    onStateChange(newState);
    setEditingId(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const isOwnKey = (id: string) => {
    return appState.keyPairs.some(kp => kp.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Add Public Key Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">添加公钥</h2>
        
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={18} />
            <span>添加新公钥</span>
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                公钥名称
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="输入公钥名称（如：张三的公钥）"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                公钥内容
              </label>
              <textarea
                value={newPublicKey}
                onChange={(e) => setNewPublicKey(e.target.value)}
                placeholder="粘贴公钥内容..."
                rows={6}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addPublicKey}
                disabled={!newKeyName.trim() || !newPublicKey.trim()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                添加
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewKeyName('');
                  setNewPublicKey('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Public Keys List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>公钥列表</span>
        </h2>
        
        {appState.publicKeys.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">还没有添加任何公钥</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appState.publicKeys.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isOwnKey(entry.id)
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit(entry.id)}
                      />
                    ) : (
                      <h3 className="font-semibold text-white">{entry.name}</h3>
                    )}
                    
                    {isOwnKey(entry.id) && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        我的公钥
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {editingId === entry.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(entry.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <>
                        {!isOwnKey(entry.id) && (
                          <button
                            onClick={() => startEdit(entry)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deletePublicKey(entry.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 mb-3">
                  <pre className="text-gray-300 text-xs break-all whitespace-pre-wrap">
                    {entry.publicKey}
                  </pre>
                </div>

                <button
                  onClick={() => copyPublicKey(entry.publicKey, entry.id)}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  {copiedId === entry.id ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedId === entry.id ? '已复制' : '复制公钥'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};