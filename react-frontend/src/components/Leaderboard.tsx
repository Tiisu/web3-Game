// Leaderboard component

import React from 'react';
import { LeaderboardProps } from '../types';
import { formatAddress } from '../config/web3Config';
import '../styles/Leaderboard.css';

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  leaderboard, 
  currentPlayer, 
  isLoading, 
  onRefresh 
}) => {
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3>Global Leaderboard 🌍</h3>
        <div className="leaderboard-controls">
          <span className="blockchain-badge">On ApeChain</span>
          <button 
            className="refresh-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh leaderboard"
          >
            🔄
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="leaderboard-loading">
          <div className="loading-spinner"></div>
          <span>Loading blockchain data...</span>
        </div>
      )}

      <div className="leaderboard-content">
        {leaderboard.length === 0 && !isLoading ? (
          <div className="leaderboard-empty">
            <p>No scores on the leaderboard yet.</p>
            <p>Be the first to score 100+ points!</p>
          </div>
        ) : (
          <ol className="leaderboard-list">
            {leaderboard.slice(0, 10).map((entry, index) => {
              const position = index + 1;
              const isCurrentPlayer = currentPlayer && 
                entry.player.toLowerCase() === currentPlayer.toLowerCase();
              
              return (
                <li 
                  key={`${entry.player}-${entry.timestamp.getTime()}`}
                  className={`leaderboard-entry ${isCurrentPlayer ? 'current-player' : ''}`}
                >
                  <div className="entry-rank">
                    <span className="rank-icon">
                      {getRankIcon(position)}
                    </span>
                  </div>
                  
                  <div className="entry-player">
                    <div className="player-name">
                      {entry.username || 'Anonymous'}
                    </div>
                    <div className="player-address">
                      {formatAddress(entry.player)}
                    </div>
                  </div>
                  
                  <div className="entry-score">
                    <div className="score-value">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="score-time">
                      {formatTimeAgo(entry.timestamp)}
                    </div>
                  </div>
                  
                  {isCurrentPlayer && (
                    <div className="current-player-indicator">
                      <span>You</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {leaderboard.length > 10 && (
        <div className="leaderboard-footer">
          <p>Showing top 10 players</p>
        </div>
      )}

      {!currentPlayer && (
        <div className="leaderboard-cta">
          <p>Connect your wallet to see your rank!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
