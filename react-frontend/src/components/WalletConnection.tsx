// Wallet connection component

import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatAddress } from '../config/web3Config';
import '../styles/WalletConnection.css';

const WalletConnection: React.FC = () => {
  const { web3State, connect, disconnect, isLoading } = useWeb3();

  const handleConnect = async () => {
    if (isLoading) return;
    await connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (web3State.isConnected && web3State.account) {
    return (
      <div className="web3-connection">
        <div className="wallet-info">
          <div className="wallet-status">
            <span className="wallet-icon">🔗</span>
            <span className="account-display">
              {formatAddress(web3State.account)}
            </span>
            <span className="network-badge">ApeChain</span>
            <button 
              className="disconnect-btn"
              onClick={handleDisconnect}
              title="Disconnect Wallet"
            >
              ✕
            </button>
          </div>
          
          {web3State.playerData && (
            <div className="player-info">
              <span className="player-username">
                {web3State.playerData.username}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="web3-connection">
      <button 
        className={`connect-wallet-btn ${isLoading ? 'loading' : ''}`}
        onClick={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading-spinner"></span>
            Connecting...
          </>
        ) : (
          '🦍 Connect Wallet to Play on ApeChain'
        )}
      </button>
    </div>
  );
};

export default WalletConnection;
