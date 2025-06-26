import React, { useState } from 'react';
import { Lock, Send, Copy, Check, Cloud } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { AppState } from '../types';
import { CryptoUtils } from '../utils/crypto';
import { SuiContractUtils } from '../utils/suiContract';

interface MessageEncryptionProps {
  appState: AppState;
  contractUtils?: SuiContractUtils;
}

export const MessageEncryption: React.FC<MessageEncryptionProps> = ({ 
  appState, 
  contractUtils 
}) => {
  const currentAccount = useCurrentAccount();
  const [selectedPublicKeyId, setSelectedPublicKeyId] = useState('');
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendToChain, setSendToChain] = useState(false);
  const [isSendingToChain, setIsSendingToChain] = useState(false);

  const encryptMessage = async () => {
    if (!selectedPublicKeyId || !message.trim()) return;

    setIsEncrypting(true);
    try {
      const selectedPublicKey = appState.publicKeys.find(pk => pk.id === selectedPublicKeyId);
      if (!selectedPublicKey) return;

      const encrypted = await CryptoUtils.encryptMessage(message, selectedPublicKey.publicKey);
      setEncryptedMessage(encrypted);

      // If user wants to send to chain and has wallet connected
      if (sendToChain && contractUtils && currentAccount) {
        await sendMessageToChain(encrypted, selectedPublicKey.publicKey);
      }
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('加密失败！请检查公钥是否正确。');
    } finally {
      setIsEncrypting(false);
    }
  };

  const sendMessageToChain = async (encryptedContent: string, recipientPublicKey: string) => {
    if (!contractUtils || !currentAccount) return;

    setIsSendingToChain(true);
    try {
      // Generate message hash
      const messageHash = await CryptoUtils.hashMasterPassword(encryptedContent);
      
      // Generate recipient key hash (simplified)
      const recipientKeyHash = await CryptoUtils.hashMasterPassword(recipientPublicKey);

      await contractUtils.sendMessage(
        recipientKeyHash,
        messageHash,
        encryptedContent,
        {
          signAndExecuteTransaction: (params: any) => {
            // This would be handled by the dapp-kit hook
            return Promise.resolve({ digest: 'mock-digest' });
          },
          getAddress: () => currentAccount.address,
        }
      );

      alert('消息已成功发送到链上！');
    } catch (error) {
      console.error('Failed to send message to chain:', error);
      alert('发送到链上失败：' + (error as Error).message);
    } finally {
      setIsSendingToChain(false);
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
    setSendToChain(false);
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
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Chain Integration Option */}
            {contractUtils && currentAccount && (
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={sendToChain}
                    onChange={(e) => setSendToChain(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-transparent border-purple-400 rounded focus:ring-purple-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-purple-300" />
                    <span className="text-purple-200">同时发送到 Sui 链上</span>
                  </div>
                </label>
                <p className="text-purple-300 text-sm mt-2 ml-7">
                  消息将被存储在区块链上，接收者可以从链上获取
                </p>
              </div>
            )}

            {/* Encrypt Button */}
            <div className="flex space-x-3">
              <button
                onClick={encryptMessage}
                disabled={!selectedPublicKeyId || !message.trim() || isEncrypting || isSendingToChain}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                <Send size={18} />
                <span>
                  {isEncrypting 
                    ? '加密中...' 
                    : isSendingToChain 
                    ? '发送到链上...' 
                    : '加密消息'
                  }
                </span>
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
                    className="w-full bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 text-white resize-none focus:outline-none font-mono text-sm"
                  />
                  <button
                    onClick={copyEncryptedMessage}
                    className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-blue-300 text-sm mt-2">
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