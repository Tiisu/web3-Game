// Main game container component

import React, { useEffect, useState } from 'react';
import WalletConnection from './WalletConnection';
import PlayerRegistration from './PlayerRegistration';
import GameBoard from './GameBoard';
import Dashboard from './Dashboard';
import GameControls from './GameControls';
import NotificationContainer from './NotificationContainer';
import GameOverModal from './GameOverModal';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import '../styles/GameContainer.css';

const GameContainer: React.FC = () => {
  const { web3State, clearPendingTransaction, clearCurrentGameId } = useWeb3();
  const { gameState, resetGame, forceCleanupGame, startGame } = useGameContext();

  // Game Over Modal state
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Check if player needs to register
  const needsRegistration = web3State.isConnected &&
                           web3State.account &&
                           (!web3State.playerData || !web3State.playerData.isRegistered);

  // Ensure game is in stopped state when component mounts
  useEffect(() => {
    const initializeGameContainer = async () => {
      // Force cleanup any running game state to ensure clean start
      if (gameState.isPlaying) {
        console.log('🛑 Game was running when GameContainer mounted, forcing cleanup');
        await forceCleanupGame();
      } else {
        // Even if not playing, reset to ensure clean state
        resetGame();
      }

      // Clear any pending Web3 transactions to ensure clean UI state
      clearPendingTransaction();

      // Clear any existing game ID to prevent auto-start behavior
      if (web3State.currentGameId) {
        console.log('🛑 Found existing game ID, clearing it:', web3State.currentGameId);
        clearCurrentGameId();
      }

      // Log current Web3 state for debugging
      console.log('🧹 GameContainer initialized with clean state', {
        currentGameId: web3State.currentGameId,
        isPlaying: gameState.isPlaying,
        isConnected: web3State.isConnected,
        isRegistered: web3State.playerData?.isRegistered
      });
    };

    initializeGameContainer();
  }, []); // Only run on mount

  // Handle game over state to show modal
  useEffect(() => {
    if (gameState.gameOver && !gameState.isPlaying && gameState.score > 0) {
      // Show game over modal after a short delay to allow for sound effects
      const timer = setTimeout(() => {
        setShowGameOverModal(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameState.gameOver, gameState.isPlaying, gameState.score]);

  // Handle Play Again
  const handlePlayAgain = async () => {
    setShowGameOverModal(false);
    // Small delay to allow modal to close smoothly
    setTimeout(async () => {
      await startGame();
    }, 300);
  };

  // Handle Close Modal
  const handleCloseModal = () => {
    setShowGameOverModal(false);
    resetGame();
  };

  // Debug logging
  console.log('GameContainer Debug:', {
    isConnected: web3State.isConnected,
    account: web3State.account,
    playerData: web3State.playerData,
    needsRegistration,
    gameIsPlaying: gameState.isPlaying,
    showGameOverModal
  });

  return (
    <div className="game-container">
      {/* Web3 Connection UI */}
      <WalletConnection />

      {/* Player Registration Modal */}
      {needsRegistration && (
        <PlayerRegistration
          isOpen={needsRegistration}
          onClose={() => {}} // Can't close until registered
        />
      )}

      {/* Main Game Area */}
      <div className="game-area">
        {/* Game Header */}
        <div className="game-header">
          <h1><span className="title">WHAC-A-MOLE</span></h1>

          {/* High Score Display */}
          <div className="high-score-display">
            <div className="high-score-card">
              <div className="high-score-icon">🏆</div>
              <div className="high-score-content">
                <div className="high-score-label">High Score</div>
                <div className="high-score-value">
                  {web3State.playerData?.highestScore || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Stats Bar */}
        <div className="game-stats-bar">
          <div className="stat-card score-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Score</div>
              <div className="stat-value">{gameState.score.toLocaleString()}</div>
            </div>
          </div>

          <div className="stat-card timer-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-label">Time</div>
              <div className={`stat-value ${gameState.timeLeft <= 10 && gameState.isPlaying ? 'timer-warning' : ''}`}>
                {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="stat-card level-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Level</div>
              <div className="stat-value">{gameState.currentLevel}</div>
            </div>
          </div>

          <div className="stat-card streak-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-label">Streak</div>
              <div className={`stat-value ${gameState.currentStreak >= 5 ? 'streak-bonus' : ''}`}>
                {gameState.currentStreak}
                {gameState.currentStreak >= 5 && <span className="streak-fire">🔥</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Section */}
        <div className="main-game-section">
          {/* Left Panel - Dashboard */}
          <div className="game-panel left-panel">
            <Dashboard />
          </div>

          {/* Center Panel - Game Board */}
          <div className="game-panel center-panel">
            <GameBoard />

            {/* Level Progress Bar */}
            <div className="level-progress-container">
              <div className="level-progress-header">
                <span className="progress-label">Level Progress</span>
                <span className="progress-info">
                  {gameState.currentLevel < 5 ?
                    `${gameState.score} / ${gameState.pointsToNextLevel}` :
                    'Max Level!'
                  }
                </span>
              </div>
              <div className="level-progress-bar">
                <div
                  className="level-progress-fill"
                  style={{
                    width: `${Math.min((gameState.score / gameState.pointsToNextLevel) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right Panel - Future Features */}
          <div className="game-panel right-panel">
            {/* Placeholder for future features */}
          </div>
        </div>

        {/* Game Controls */}
        <div className="game-controls-section">
          <GameControls />
        </div>
      </div>

      {/* Notifications */}
      <NotificationContainer />

      {/* Game Over Modal */}
      <GameOverModal
        isVisible={showGameOverModal}
        onPlayAgain={handlePlayAgain}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default GameContainer;
