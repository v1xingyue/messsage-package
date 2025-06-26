import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { SuiContractUtils, OnChainPublicKey, CONTRACT_CONFIG } from '../utils/suiContract';
import { Cloud, CloudOff, Activity, Users, MessageSquare, Loader2 } from 'lucide-react';

interface ChainIntegrationProps {
  onChainKeysLoaded: (keys: OnChainPublicKey[]) => void;
}

export const ChainIntegration: React.FC<ChainIntegrationProps> = ({ onChainKeysLoaded }) => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const [contractUtils] = useState(() => new SuiContractUtils(suiClient));
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({ totalKeys: 0, totalMessages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [userOnChainKey, setUserOnChainKey] = useState<OnChainPublicKey | null>(null);

  useEffect(() => {
    checkContractConnection();
  }, [currentAccount]);

  useEffect(() => {
    if (isConnected) {
      loadChainData();
    }
  }, [isConnected]);

  const checkContractConnection = async () => {
    if (!currentAccount || CONTRACT_CONFIG.PACKAGE_ID === '0x0') {
      setIsConnected(false);
      return;
    }

    try {
      await contractUtils.getContractStats();
      setIsConnected(true);
    } catch (error) {
      console.error('Contract connection failed:', error);
      setIsConnected(false);
    }
  };

  const loadChainData = async () => {
    if (!currentAccount) return;

    setIsLoading(true);
    try {
      // Load contract stats
      const contractStats = await contractUtils.getContractStats();
      setStats(contractStats);

      // Load all public keys
      const allKeys = await contractUtils.getAllPublicKeys();
      onChainKeysLoaded(allKeys);

      // Check if current user has a key on chain
      const userKey = await contractUtils.getPublicKeyInfo(currentAccount.address);
      setUserOnChainKey(userKey);
    } catch (error) {
      console.error('Error loading chain data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerKeyOnChain = async (publicKey: string, name: string) => {
    if (!currentAccount) return;

    try {
      setIsLoading(true);
      await contractUtils.registerPublicKey(
        publicKey,
        name,
        { signAndExecuteTransaction, getAddress: () => currentAccount.address }
      );
      
      // Reload data after registration
      await loadChainData();
    } catch (error) {
      console.error('Error registering key on chain:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageOnChain = async (
    recipientKeyHash: string,
    messageHash: string,
    encryptedContent: string
  ) => {
    if (!currentAccount) return;

    try {
      setIsLoading(true);
      await contractUtils.sendMessage(
        recipientKeyHash,
        messageHash,
        encryptedContent,
        { signAndExecuteTransaction, getAddress: () => currentAccount.address }
      );
      
      // Reload stats
      const contractStats = await contractUtils.getContractStats();
      setStats(contractStats);
    } catch (error) {
      console.error('Error sending message on chain:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Cloud className="w-5 h-5" />
          <span>链上集成</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          {isLoading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
            {isConnected ? '已连接' : '未连接'}
          </span>
        </div>
      </div>

      {CONTRACT_CONFIG.PACKAGE_ID === '0x0' ? (
        <div className="text-center py-6">
          <CloudOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">合约未部署</p>
          <p className="text-gray-500 text-sm">请先部署 Sui Move 合约并配置环境变量</p>
        </div>
      ) : !currentAccount ? (
        <div className="text-center py-6">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">请连接钱包</p>
          <p className="text-gray-500 text-sm">连接 Sui 钱包以使用链上功能</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Contract Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-300" />
                <span className="text-blue-200 text-sm">链上公钥</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalKeys}</p>
            </div>
            
            <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-cyan-300" />
                <span className="text-cyan-200 text-sm">链上消息</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
            </div>
          </div>

          {/* User Status */}
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">您的链上状态</p>
                <p className="text-white font-medium">
                  {userOnChainKey ? `已注册: ${userOnChainKey.name}` : '未注册公钥'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${userOnChainKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={loadChainData}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors text-sm"
            >
              <Activity className="w-4 h-4" />
              <span>刷新数据</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export utilities for use in other components
export { contractUtils: SuiContractUtils };