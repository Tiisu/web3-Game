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
        <h1><span className="title">WHAC-A-MOLE</span></h1>

        {/* Game Layout Grid */}
        <div className="game-layout">
          {/* Left Sidebar */}
          <div className="game-sidebar-left">
            <Dashboard />

            {/* High Score Display */}
            <div className="high-score-container">
              <div className="high-score">
                <span className="high-score-label">High Score:</span>
                <span className="high-score-value" id="highScore">
                  {web3State.playerData?.highestScore || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Main Game Board Section */}
          <div className="game-board-section">
            {/* Game Info Display */}
            <div className="game-info">
              <div className="score-display">
                <span className="score-label">Score</span>
                <span className="score-value" id="score">{gameState.score}</span>
              </div>

              <div className="timer-display">
                <span className="timer-label">Time</span>
                <span
                  className={`timer-value ${gameState.timeLeft <= 10 && gameState.isPlaying ? 'timer-warning' : ''}`}
                  id="timer"
                >
                  {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="level-display">
                <span className="level-label">Level</span>
                <span className="level-value" id="level">{gameState.currentLevel}</span>
              </div>

              <div className="streak-display">
                <span className="streak-label">Streak</span>
                <span className={`streak-value ${gameState.currentStreak >= 5 ? 'streak-bonus' : ''}`}>
                  {gameState.currentStreak}
                  {gameState.currentStreak >= 5 && <span className="streak-fire">🔥</span>}
                </span>
              </div>
            </div>

            {/* Game Board */}
            <GameBoard />

            {/* Game Controls */}
            <GameControls />

            {/* Level Progress Bar */}
            <div className="level-progress-container">
              <div className="level-progress-bar">
                <div
                  className="level-progress-fill"
                  style={{
                    width: `${Math.min((gameState.score / gameState.pointsToNextLevel) * 100, 100)}%`
                  }}
                ></div>
              </div>
              <div className="level-progress-text">
                {gameState.currentLevel < 5 ?
                  `${gameState.score} / ${gameState.pointsToNextLevel} to next level` :
                  'Max Level Reached!'
                }
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="game-sidebar-right">
            {/* Additional components can go here */}
          </div>
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
