// Cohesive Web3 Status Indicator System
// Provides unified status display that blends with game UI

import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Web3StatusBadge } from './Web3Feedback';
import '../styles/Web3StatusIndicator.css';

interface Web3StatusIndicatorProps {
  position?: 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  compact?: boolean;
  showDetails?: boolean;
}

export const Web3StatusIndicator: React.FC<Web3StatusIndicatorProps> = ({
  position = 'top-right',
  compact = false,
  showDetails = true
}) => {
  const { web3State, isLoading, pendingTransaction } = useWeb3();

  const getConnectionStatus = () => {
    if (pendingTransaction) {
      return {
        status: 'pending' as const,
        icon: '⏳',
        text: 'Transaction Pending',
        detail: pendingTransaction.message
      };
    }

    if (!web3State.isConnected) {
      return {
        status: 'local' as const,
        icon: '💻',
        text: 'Local Mode',
        detail: 'Connect wallet for Web3 features'
      };
    }

    if (!web3State.playerData?.isRegistered) {
      return {
        status: 'pending' as const,
        icon: '⚠️',
        text: 'Registration Required',
        detail: 'Complete registration to play'
      };
    }

    return {
      status: 'connected' as const,
      icon: '🔗',
      text: 'Web3 Connected',
      detail: `Playing as ${web3State.playerData.username}`
    };
  };

  const getNetworkStatus = () => {
    if (!web3State.isConnected) return null;

    return {
      status: 'blockchain' as const,
      icon: '🦍',
      text: 'ApeChain',
      detail: 'Testnet'
    };
  };

  const getGameStatus = () => {
    if (!web3State.isConnected || !web3State.playerData?.isRegistered) {
      return null;
    }

    const stats = web3State.playerData;
    return {
      status: 'connected' as const,
      icon: '🎮',
      text: `Level ${Math.floor(stats.totalScore / 1000) + 1}`,
      detail: `${stats.totalScore.toLocaleString()} total score`
    };
  };

  const connectionStatus = getConnectionStatus();
  const networkStatus = getNetworkStatus();
  const gameStatus = getGameStatus();

  if (compact) {
    return (
      <div className={`web3-status-compact ${position}`}>
        <Web3StatusBadge
          status={connectionStatus.status}
          icon={connectionStatus.icon}
          text={connectionStatus.text}
        />
      </div>
    );
  }

  return (
    <div className={`web3-status-indicator ${position}`}>
      <div className="status-panel">
        <div className="status-header">
          <span className="status-title">🎮 Game Status</span>
          {isLoading && (
            <div className="status-loading">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          )}
        </div>

        <div className="status-items">
          {/* Connection Status */}
          <div className="status-item">
            <Web3StatusBadge
              status={connectionStatus.status}
              icon={connectionStatus.icon}
              text={connectionStatus.text}
            />
            {showDetails && (
              <div className="status-detail">{connectionStatus.detail}</div>
            )}
          </div>

          {/* Network Status */}
          {networkStatus && (
            <div className="status-item">
              <Web3StatusBadge
                status={networkStatus.status}
                icon={networkStatus.icon}
                text={networkStatus.text}
              />
              {showDetails && (
                <div className="status-detail">{networkStatus.detail}</div>
              )}
            </div>
          )}

          {/* Game Status */}
          {gameStatus && (
            <div className="status-item">
              <Web3StatusBadge
                status={gameStatus.status}
                icon={gameStatus.icon}
                text={gameStatus.text}
              />
              {showDetails && (
                <div className="status-detail">{gameStatus.detail}</div>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats for Connected Users */}
        {web3State.isConnected && web3State.playerData?.isRegistered && (
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-icon">🏆</span>
              <span className="stat-value">{web3State.playerData.highestScore.toLocaleString()}</span>
              <span className="stat-label">Best Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{web3State.playerData.totalGamesPlayed}</span>
              <span className="stat-label">Games</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎖️</span>
              <span className="stat-value">{web3State.achievements?.length || 0}</span>
              <span className="stat-label">NFTs</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mini status indicator for in-game use
export const Web3MiniStatus: React.FC = () => {
  const { web3State, pendingTransaction } = useWeb3();

  if (pendingTransaction) {
    return (
      <div className="web3-mini-status pending">
        <span className="mini-icon">⏳</span>
        <span className="mini-text">Signing...</span>
      </div>
    );
  }

  if (!web3State.isConnected) {
    return (
      <div className="web3-mini-status local">
        <span className="mini-icon">💻</span>
        <span className="mini-text">Local</span>
      </div>
    );
  }

  if (!web3State.playerData?.isRegistered) {
    return (
      <div className="web3-mini-status warning">
        <span className="mini-icon">⚠️</span>
        <span className="mini-text">Register</span>
      </div>
    );
  }

  return (
    <div className="web3-mini-status connected">
      <span className="mini-icon">🔗</span>
      <span className="mini-text">Web3</span>
    </div>
  );
};

// Status bar for bottom of screen
export const Web3StatusBar: React.FC = () => {
  const { web3State, pendingTransaction } = useWeb3();

  return (
    <div className="web3-status-bar">
      <div className="status-bar-left">
        <Web3MiniStatus />
        {web3State.isConnected && (
          <div className="network-indicator">
            <span className="network-icon">🦍</span>
            <span className="network-name">ApeChain</span>
          </div>
        )}
      </div>

      <div className="status-bar-center">
        {pendingTransaction && (
          <div className="transaction-indicator">
            <div className="transaction-pulse"></div>
            <span className="transaction-text">{pendingTransaction.message}</span>
          </div>
        )}
      </div>

      <div className="status-bar-right">
        {web3State.playerData?.isRegistered && (
          <div className="player-indicator">
            <span className="player-icon">👤</span>
            <span className="player-name">{web3State.playerData.username}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Web3StatusIndicator;
