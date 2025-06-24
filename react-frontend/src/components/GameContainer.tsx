// Enhanced Game Container with Modern UI

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, Zap, Settings, Gamepad2 } from 'lucide-react';
import WalletConnection from './WalletConnection';
import PlayerRegistration from './PlayerRegistration';
import GameBoard from './GameBoard';
import Dashboard from './Dashboard';
import GameControls from './GameControls';
import NotificationContainer from './NotificationContainer';
import GameOverModal from './GameOverModal';
import { GameLayout, GameSection, GamePanel, GameGrid, GameHeader, GameStatsBar } from './GameLayout';
import { Card, CardContent, Badge, Progress } from './ui';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import { formatNumber } from '../lib/utils';
import '../styles/GameContainer.css';
import '../styles/GameLayout.css';

const GameContainer: React.FC = () => {
  const { web3State, clearPendingTransaction, clearCurrentGameId } = useWeb3();
  const { gameState, resetGame, forceCleanupGame, startGame } = useGameContext();

  // Game Over Modal state
  const [showGameOverModal, setShowGameOverModal] = useState(false);

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
    <GameLayout>
      {/* Web3 Connection UI */}
      <GamePanel variant="glass" padding="md">
        <WalletConnection />
      </GamePanel>

      {/* Player Registration Modal */}
      {needsRegistration && (
        <PlayerRegistration
          isOpen={needsRegistration}
          onClose={() => {}} // Can't close until registered
        />
      )}

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

      {/* Notifications */}
      <NotificationContainer />

      {/* Game Over Modal */}
      <GameOverModal
        isVisible={showGameOverModal}
        onPlayAgain={handlePlayAgain}
        onClose={handleCloseModal}
      />
    </GameLayout>
  );
};

export default GameContainer;