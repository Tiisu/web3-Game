<<<<<<< HEAD
// Main game container component

import React, { useEffect, useState } from 'react';
=======
// Enhanced Game Container with Modern UI

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, Zap, Settings, Gamepad2 } from 'lucide-react';
>>>>>>> master
import WalletConnection from './WalletConnection';
import PlayerRegistration from './PlayerRegistration';
import GameBoard from './GameBoard';
import Dashboard from './Dashboard';
import GameControls from './GameControls';
import NotificationContainer from './NotificationContainer';
import GameOverModal from './GameOverModal';
<<<<<<< HEAD
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import '../styles/GameContainer.css';
=======
import { GameLayout, GameSection, GamePanel, GameGrid, GameHeader, GameStatsBar } from './GameLayout';
import { Card, CardContent, Badge, Progress } from './ui';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import { formatNumber } from '../lib/utils';
import '../styles/GameContainer.css';
import '../styles/GameLayout.css';
>>>>>>> master

const GameContainer: React.FC = () => {
  const { web3State, clearPendingTransaction, clearCurrentGameId } = useWeb3();
  const { gameState, resetGame, forceCleanupGame, startGame } = useGameContext();

  // Game Over Modal state
  const [showGameOverModal, setShowGameOverModal] = useState(false);

<<<<<<< HEAD
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
=======
  // Check if user needs registration
  const needsRegistration = web3State.isConnected && 
    web3State.playerData && 
    !web3State.playerData.isRegistered;

  // Initialize game container
  useEffect(() => {
    const initializeGameContainer = async () => {
      console.log('🎮 Initializing GameContainer...');
      
      // Clear any pending transactions on mount
      if (clearPendingTransaction) {
        clearPendingTransaction();
      }
      
      // Clear any stale game IDs
      if (clearCurrentGameId) {
        clearCurrentGameId();
      }
      
      // Force cleanup any incomplete games
      if (forceCleanupGame) {
        forceCleanupGame();
      }
      
      console.log('✅ GameContainer initialized');
>>>>>>> master
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
<<<<<<< HEAD
    <div className="game-container">
      {/* Web3 Connection UI */}
      <WalletConnection />
=======
    <GameLayout>
      {/* Web3 Connection UI */}
      <GamePanel variant="glass" padding="md">
        <WalletConnection />
      </GamePanel>
>>>>>>> master

      {/* Player Registration Modal */}
      {needsRegistration && (
        <PlayerRegistration
          isOpen={needsRegistration}
          onClose={() => {}} // Can't close until registered
        />
      )}

<<<<<<< HEAD
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
=======
      {/* Game Header */}
      <GameHeader
        title="Whac-A-Mole Web3"
        subtitle="Test your reflexes and earn rewards!"
        actions={
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-gaming-accent" />
            <span className="text-sm text-ui-text-secondary">
              Level {gameState.currentLevel}
            </span>
          </div>
        }
      />

      {/* Game Stats */}
      <GameSection>
        <GameStatsBar
          stats={[
            {
              label: 'Score',
              value: formatNumber(gameState.score),
              icon: <Target className="w-5 h-5" />,
              variant: 'default'
            },
            {
              label: 'Time',
              value: `${Math.floor(gameState.timeLeft / 60)}:${(gameState.timeLeft % 60).toString().padStart(2, '0')}`,
              icon: <Clock className="w-5 h-5" />,
              variant: gameState.timeLeft <= 10 && gameState.isPlaying ? 'warning' : 'default'
            },
            {
              label: 'Level',
              value: gameState.currentLevel,
              icon: <Zap className="w-5 h-5" />,
              variant: 'success'
            },
            {
              label: 'Best Score',
              value: formatNumber(gameState.highScore),
              icon: <Trophy className="w-5 h-5" />,
              variant: gameState.score > gameState.highScore && gameState.score > 0 ? 'success' : 'default'
            }
          ]}
        />
      </GameSection>

      {/* Main Game Section */}
      <GameSection>
        <GameGrid columns={2} gap="lg" className="lg:grid-cols-1">
          {/* Game Board Section */}
          <GamePanel variant="glass" padding="none" className="flex flex-col gap-component">
            <GameBoard />
            
            {/* Level Progress */}
            <motion.div
              className="p-component"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card variant="gaming" padding="md">
                <CardContent>
                  <Progress
                    value={gameState.score}
                    max={gameState.pointsToNextLevel}
                    variant="gaming"
                    size="lg"
                    animated
                    showValue
                    label={gameState.currentLevel < 5 ? "Level Progress" : "Max Level Reached!"}
                    glow
                  />
                  <div className="mt-2 text-center text-sm text-gray-300">
                    {gameState.currentLevel < 5 ?
                      `${formatNumber(gameState.score)} / ${formatNumber(gameState.pointsToNextLevel)} points` :
                      'You have reached the maximum level!'
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </GamePanel>

          {/* Dashboard Section */}
          <GamePanel variant="glass" padding="none">
            <Dashboard />
          </GamePanel>
        </GameGrid>
      </GameSection>

      {/* Game Controls */}
      <GameSection>
        <GameControls />
      </GameSection>
>>>>>>> master

      {/* Notifications */}
      <NotificationContainer />

      {/* Game Over Modal */}
      <GameOverModal
        isVisible={showGameOverModal}
        onPlayAgain={handlePlayAgain}
        onClose={handleCloseModal}
      />
<<<<<<< HEAD
    </div>
  );
};

export default GameContainer;
=======
    </GameLayout>
  );
};

export default GameContainer;
>>>>>>> master
