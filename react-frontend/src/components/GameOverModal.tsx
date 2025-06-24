// Game Over Modal Component

import React from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/GameOverModal.css';

interface GameOverModalProps {
  isVisible: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isVisible, onPlayAgain, onClose }) => {
  const { gameState, gameStats } = useGameContext();
  const { web3State } = useWeb3();

  if (!isVisible) return null;

  // Calculate game statistics
  const timePlayed = 120 - gameState.timeLeft;
  const accuracy = gameState.molesHit > 0 ? Math.round((gameState.molesHit / (gameState.molesHit + gameState.plantsHit)) * 100) : 0;
  const pointsPerSecond = timePlayed > 0 ? Math.round(gameState.score / timePlayed) : 0;

  // Determine Web3 status
  const isWeb3Connected = web3State.isConnected && web3State.playerData?.isRegistered;
  const web3StatusIcon = isWeb3Connected ? '✅' : '⚠️';
  const web3StatusText = isWeb3Connected ? 'Saved to ApeChain' : 'Local game only';
  const web3StatusClass = isWeb3Connected ? 'web3-connected' : 'web3-local';

  // Performance rating
  const getPerformanceRating = (score: number) => {
    if (score >= 10000) return { rating: 'LEGENDARY', emoji: '👑', color: '#ffd700' };
    if (score >= 5000) return { rating: 'EPIC', emoji: '🏆', color: '#ff6b35' };
    if (score >= 2500) return { rating: 'GREAT', emoji: '🎯', color: '#6c5ce7' };
    if (score >= 1000) return { rating: 'GOOD', emoji: '👍', color: '#00b894' };
    return { rating: 'KEEP TRYING', emoji: '💪', color: '#74b9ff' };
  };

  const performance = getPerformanceRating(gameState.score);

  return (
    <div className="modal-overlay game-over-overlay">
      <div className="game-over-modal">
        {/* Header */}
        <div className="game-over-header">
          <h1 className="game-over-title">GAME OVER!</h1>
          <div className="performance-badge" style={{ color: performance.color }}>
            <span className="performance-emoji">{performance.emoji}</span>
            <span className="performance-text">{performance.rating}</span>
          </div>
        </div>

        {/* Final Score */}
        <div className="final-score-section">
          <div className="final-score-label">Final Score</div>
          <div className="final-score-value">{gameState.score.toLocaleString()}</div>
        </div>

        {/* Game Statistics */}
        <div className="game-stats-grid">
          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{gameState.molesHit}</div>
            <div className="stat-label">Moles Hit</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">🌱</div>
            <div className="stat-value">{gameState.plantsHit}</div>
            <div className="stat-label">Plants Hit</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-value">Level {gameState.currentLevel}</div>
            <div className="stat-label">Level Reached</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{timePlayed}s</div>
            <div className="stat-label">Time Played</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">🎲</div>
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{pointsPerSecond}</div>
            <div className="stat-label">Points/Sec</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{gameState.bestStreak}</div>
            <div className="stat-label">Best Streak</div>
          </div>
        </div>

        {/* Web3 Status */}
        <div className={`web3-status ${web3StatusClass}`}>
          <span className="web3-status-icon">{web3StatusIcon}</span>
          <span className="web3-status-text">{web3StatusText}</span>
        </div>

        {/* Action Buttons */}
        <div className="game-over-actions">
          <button 
            className="btn game-over-btn play-again-btn"
            onClick={onPlayAgain}
          >
            <span className="btn-icon">🎮</span>
            Play Again
          </button>
          
          <button 
            className="btn game-over-btn close-btn"
            onClick={onClose}
          >
            <span className="btn-icon">🏠</span>
            Back to Menu
          </button>
        </div>

        {/* High Score Indicator */}
        {gameState.score > (gameStats.totalScore / Math.max(gameStats.gamesPlayed, 1)) && (
          <div className="new-record-badge">
            <span className="record-icon">🎉</span>
            <span className="record-text">Personal Best!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOverModal;
