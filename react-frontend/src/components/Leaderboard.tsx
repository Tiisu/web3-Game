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
<<<<<<< HEAD
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3>Global Leaderboard 🌍</h3>
        <div className="leaderboard-controls">
          <span className="blockchain-badge">On ApeChain</span>
=======
    <div className="leaderboard-section">
      <div className="leaderboard-header">
        <div className="header-content">
          <h3 className="leaderboard-title">🏆 Global Leaderboard</h3>
          <div className="leaderboard-subtitle">Top players on ApeChain</div>
        </div>
        <div className="leaderboard-controls">
          <div className="blockchain-badge">
            <span className="badge-icon">🔗</span>
            <span>On-Chain</span>
          </div>
>>>>>>> master
          <button 
            className="refresh-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh leaderboard"
          >
<<<<<<< HEAD
            🔄
=======
            <span className={`refresh-icon ${isLoading ? 'spinning' : ''}`}>🔄</span>
>>>>>>> master
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
<<<<<<< HEAD
            <p>No scores on the leaderboard yet.</p>
            <p>Be the first to score 100+ points!</p>
          </div>
        ) : (
          <ol className="leaderboard-list">
=======
            <div className="empty-icon">🎯</div>
            <div className="empty-title">No scores yet!</div>
            <div className="empty-subtitle">Be the first to score 100+ points and claim the top spot!</div>
          </div>
        ) : (
          <div className="leaderboard-list">
>>>>>>> master
            {leaderboard.slice(0, 10).map((entry, index) => {
              const position = index + 1;
              const isCurrentPlayer = currentPlayer && 
                entry.player.toLowerCase() === currentPlayer.toLowerCase();
              
              return (
<<<<<<< HEAD
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
=======
                <div 
                  key={`${entry.player}-${entry.timestamp.getTime()}`}
                  className={`leaderboard-entry ${isCurrentPlayer ? 'current-player' : ''} ${position <= 3 ? `rank-${position}` : ''}`}
                >
                  <div className="entry-rank">
                    <div className="rank-badge">
                      <span className="rank-icon">
                        {getRankIcon(position)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="entry-details">
                    <div className="player-info">
                      <div className="player-name">
                        {entry.username || 'Anonymous Player'}
                        {isCurrentPlayer && <span className="you-badge">YOU</span>}
                      </div>
                      <div className="player-address">
                        {formatAddress(entry.player)}
                      </div>
                    </div>
                    
                    <div className="score-info">
                      <div className="score-value">
                        {entry.score.toLocaleString()}
                        <span className="score-label">pts</span>
                      </div>
                      <div className="score-time">
                        {formatTimeAgo(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
>>>>>>> master
        )}
      </div>

      {leaderboard.length > 10 && (
        <div className="leaderboard-footer">
<<<<<<< HEAD
          <p>Showing top 10 players</p>
=======
          <div className="footer-info">
            <span className="info-icon">📊</span>
            <span>Showing top 10 of {leaderboard.length} players</span>
          </div>
>>>>>>> master
        </div>
      )}

      {!currentPlayer && (
        <div className="leaderboard-cta">
<<<<<<< HEAD
          <p>Connect your wallet to see your rank!</p>
=======
          <div className="cta-content">
            <div className="cta-icon">🔗</div>
            <div className="cta-text">
              <div className="cta-title">Connect Your Wallet</div>
              <div className="cta-subtitle">See your rank and compete for the top spot!</div>
            </div>
          </div>
>>>>>>> master
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
