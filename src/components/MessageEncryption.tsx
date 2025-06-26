import React, { useState } from 'react';
import { Lock, Send, Copy, Check } from 'lucide-react';
import { AppState } from '../types';
import { CryptoUtils } from '../utils/crypto';

interface MessageEncryptionProps {
  appState: AppState;
}

export const MessageEncryption: React.FC<MessageEncryptionProps> = ({ appState }) => {
  const [selectedPublicKeyId, setSelectedPublicKeyId] = useState('');
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [copied, setCopied] = useState(false);

  const encryptMessage = async () => {
    if (!selectedPublicKeyId || !message.trim()) return;

    setIsEncrypting(true);
    try {
      const selectedPublicKey = appState.publicKeys.find(pk => pk.id === selectedPublicKeyId);
      if (!selectedPublicKey) return;

      const encrypted = await CryptoUtils.encryptMessage(message, selectedPublicKey.publicKey);
      setEncryptedMessage(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('加密失败！请检查公钥是否正确。');
    } finally {
      setIsEncrypting(false);
    }
  };

  const copyEncryptedMessage = async () => {
    try {
      await navigator.clipboard.writeText(encryptedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const clearAll = () => {
    setMessage('');
    setEncryptedMessage('');
    setSelectedPublicKeyId('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Lock className="w-6 h-6" />
          <span>加密消息</span>
        </h2>

        {appState.publicKeys.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">没有可用的公钥</p>
            <p className="text-gray-500 text-sm">请先在"公钥列表"中添加公钥，或生成自己的密钥对</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Public Key Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                选择接收者公钥
              </label>
              <select
                value={selectedPublicKeyId}
                onChange={(e) => setSelectedPublicKeyId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">请选择公钥</option>
                {appState.publicKeys.map((pk) => (
                  <option key={pk.id} value={pk.id} className="bg-gray-800">
                    {pk.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                要加密的消息
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入要加密的消息..."
                rows={6}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Encrypt Button */}
            <div className="flex space-x-3">
              <button
                onClick={encryptMessage}
                disabled={!selectedPublicKeyId || !message.trim() || isEncrypting}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                <Send size={18} />
                <span>{isEncrypting ? '加密中...' : '加密消息'}</span>
              </button>
              
              {(message || encryptedMessage) && (
                <button
                  onClick={clearAll}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-colors"
                >
                  清空
                </button>
              )}
            </div>

            {/* Encrypted Message Output */}
            {encryptedMessage && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  加密后的消息
                </label>
                <div className="relative">
                  <textarea
                    value={encryptedMessage}
                    readOnly
                    rows={8}
                    className="w-full bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-white resize-none focus:outline-none"
                  />
                  <button
                    onClick={(copyEncryptedMessage)}
                    className="absolute top-3 right-3 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-green-300 text-sm mt-2">
                  {copied ? '✓ 已复制到剪贴板' : '点击右上角按钮复制加密消息'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};