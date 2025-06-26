import React from 'react';
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { Wallet, LogOut } from 'lucide-react';

export const WalletConnection: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  if (currentAccount) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-xl px-3 py-2">
          <Wallet className="w-4 h-4 text-blue-300" />
          <span className="text-blue-200 text-sm">
            {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm">断开</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Wallet className="w-4 h-4 text-blue-300" />
      <ConnectButton 
        connectText="连接钱包"
        connectedText="已连接"
        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 text-sm"
      />
    </div>
  );
};