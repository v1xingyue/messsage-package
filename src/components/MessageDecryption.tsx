import React, { useState } from 'react';
import { Unlock, Eye, AlertCircle } from 'lucide-react';
import { AppState } from '../types';
import { CryptoUtils } from '../utils/crypto';

interface MessageDecryptionProps {
  appState: AppState;
  masterPassword: string;
}

export const MessageDecryption: React.FC<MessageDecryptionProps> = ({ 
  appState, 
  masterPassword 
}) => {
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState('');

  const activeKeyPair = appState.keyPairs.find(kp => kp.isActive);

  const decryptMessage = async () => {
    if (!encryptedMessage.trim() || !activeKeyPair) return;

    setIsDecrypting(true);
    setError('');
    setDecryptedMessage('');

    try {
      // Decrypt the private key first
      const decryptedPrivateKey = await CryptoUtils.decryptPrivateKey(
        activeKeyPair.privateKey, 
        masterPassword
      );
      
      // Then decrypt the message
      const decrypted = await CryptoUtils.decryptMessage(encryptedMessage, decryptedPrivateKey);
      setDecryptedMessage(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      setError('解密失败！请检查消息是否正确，或者是否使用了正确的密钥对。');
    } finally {
      setIsDecrypting(false);
    }
  };

  const clearAll = () => {
    setEncryptedMessage('');
    setDecryptedMessage('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Unlock className="w-6 h-6" />
          <span>解密消息</span>
        </h2>

        {!activeKeyPair ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-yellow-300 mb-2">没有活跃的密钥对</p>
            <p className="text-gray-400 text-sm">请先在"密钥管理"中生成或激活一个密钥对</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Key Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-blue-200 font-medium">当前活跃密钥对: {activeKeyPair.name}</span>
              </div>
              <p className="text-blue-300 text-sm">
                将使用此密钥对来解密消息
              </p>
            </div>

            {/* Encrypted Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                加密的消息
              </label>
              <textarea
                value={encryptedMessage}
                onChange={(e) => setEncryptedMessage(e.target.value)}
                placeholder="粘贴要解密的消息..."
                rows={8}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
              />
            </div>

            {/* Decrypt Button */}
            <div className="flex space-x-3">
              <button
                onClick={decryptMessage}
                disabled={!encryptedMessage.trim() || isDecrypting}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                <Eye size={18} />
                <span>{isDecrypting ? '解密中...' : '解密消息'}</span>
              </button>
              
              {(encryptedMessage || decryptedMessage || error) && (
                <button
                  onClick={clearAll}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-colors"
                >
                  清空
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Decrypted Message Output */}
            {decryptedMessage && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  解密后的消息
                </label>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <pre className="text-blue-100 whitespace-pre-wrap break-words">
                    {decryptedMessage}
                  </pre>
                </div>
                <p className="text-blue-300 text-sm mt-2">
                  ✓ 消息解密成功
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};