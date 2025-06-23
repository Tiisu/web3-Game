// Game Context for managing game state and logic

import React, { createContext, useContext, useCallback } from 'react';
import { GameContextType } from '../types';
import { useGame } from '../hooks/useGame';
import { useWeb3 } from './Web3Context';
import { useNotifications } from '../hooks/useNotifications';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const {
    gameState,
    gameStats,
    moles,
    startGame: startLocalGame,
    pauseGame,
    resumeGame,
    stopGame: stopLocalGame,
    handleMoleClick,
    resetGame,
    settings,
    updateSettings
  } = useGame();

  const { web3State, startGameSession, completeGameSession, clearPendingTransaction } = useWeb3();
  const { addErrorNotification } = useNotifications();

  // Enhanced start game with Web3 integration
  const startGame = useCallback(async () => {
    try {
      // Check if player is registered for Web3 features
      if (web3State.isConnected && web3State.playerData && !web3State.playerData.isRegistered) {
        addErrorNotification('Please register your player profile first to earn achievements and compete on the leaderboard!');
        return;
      }

      // For connected and registered users, try Web3 transaction but allow fallback to local game
      if (web3State.isConnected && web3State.playerData?.isRegistered) {
        try {
          // Try to start Web3 game session with timeout
          console.log('🎮 Attempting to start Web3 game session...');

          // Create a timeout promise that rejects after 30 seconds
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Transaction timeout - taking too long to confirm')), 30000);
          });

          // Race between the actual transaction and the timeout
          await Promise.race([
            startGameSession(),
            timeoutPromise
          ]);

          console.log('🎮 Web3 game session started successfully');

          // Start local game after Web3 transaction is confirmed
          await startLocalGame();
        } catch (error: any) {
          console.error('Failed to start Web3 game session:', error);

          // Clear any pending transaction state to reset UI
          clearPendingTransaction();

          // Check if user rejected the transaction
          if (error.message && (error.message.includes('User rejected') || error.message.includes('user rejected') || error.code === 4001)) {
            addErrorNotification('Transaction cancelled. You can still play locally, but your score won\'t be saved to the blockchain.');
            // Allow local game to start even if user rejects transaction
            await startLocalGame();
          } else if (error.message && (error.message.includes('insufficient funds') || error.code === -32603)) {
            addErrorNotification('Insufficient funds for transaction. Playing in local mode.');
            // Allow local game to start with insufficient funds
            await startLocalGame();
          } else if (error.message && error.message.includes('network')) {
            addErrorNotification('Network error. Playing in local mode.');
            // Allow local game to start with network issues
            await startLocalGame();
          } else if (error.message && error.message.includes('timeout')) {
            addErrorNotification('Transaction is taking too long. Playing in local mode.');
            // Allow local game to start if transaction times out
            await startLocalGame();
          } else {
            addErrorNotification(`Web3 transaction failed: ${error.message || 'Unknown error'}. Playing in local mode.`);
            // Allow local game to start for any other Web3 errors
            await startLocalGame();
          }
        }
      } else {
        // For unconnected users or trial users, start local game directly
        await startLocalGame();
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      addErrorNotification('Failed to start game. Please try again.');
    }
  }, [startLocalGame, web3State, startGameSession, clearPendingTransaction, addErrorNotification]);

  // Enhanced stop game with Web3 integration and trial handling
  const stopGame = useCallback(async () => {
    try {
      // Complete Web3 game session if available
      if (web3State.isConnected &&
          web3State.playerData?.isRegistered &&
          web3State.currentGameId) {
        try {
          await completeGameSession(
            web3State.currentGameId,
            gameState.score,
            gameState.molesHit,
            gameState.currentLevel
          );
          console.log('🏆 Web3 game session completed');
        } catch (error) {
          console.error('Failed to complete Web3 game session:', error);
          // Continue with local game completion even if Web3 fails
        }
      }

      // Stop local game
      await stopLocalGame();

      // Handle trial game completion
      // This will be handled by the AppContext through the TrialGameOverlay

    } catch (error) {
      console.error('Failed to stop game:', error);
      addErrorNotification('Failed to complete game. Please try again.');
    }
  }, [stopLocalGame, web3State, completeGameSession, gameState, addErrorNotification]);

  // Force cleanup game state - used when trial ends
  const forceCleanupGame = useCallback(async () => {
    try {
      console.log('🧹 Force cleaning up game state');
      // Stop the game if it's running
      if (gameState.isPlaying) {
        await stopLocalGame();
      }
      // Reset game state
      resetGame();
    } catch (error) {
      console.error('Failed to force cleanup game:', error);
    }
  }, [gameState.isPlaying, stopLocalGame, resetGame]);

  const contextValue: GameContextType = {
    gameState,
    gameStats,
    moles,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    handleMoleClick,
    resetGame,
    forceCleanupGame,
    settings,
    updateSettings
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
