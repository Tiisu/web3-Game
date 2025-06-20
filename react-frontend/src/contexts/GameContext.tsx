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

  const { web3State, startGameSession, completeGameSession } = useWeb3();
  const { addErrorNotification } = useNotifications();

  // Enhanced start game with Web3 integration
  const startGame = useCallback(async () => {
    try {
      // Check if player is registered for Web3 features
      if (web3State.isConnected && web3State.playerData && !web3State.playerData.isRegistered) {
        addErrorNotification('Please register your player profile first to earn achievements and compete on the leaderboard!');
        return;
      }

      // Start local game
      await startLocalGame();

      // Start Web3 game session if connected and registered
      if (web3State.isConnected && web3State.playerData?.isRegistered) {
        try {
          await startGameSession();
          console.log('🎮 Web3 game session started');
        } catch (error) {
          console.error('Failed to start Web3 game session:', error);
          // Continue with local game even if Web3 fails
        }
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      addErrorNotification('Failed to start game. Please try again.');
    }
  }, [startLocalGame, web3State, startGameSession, addErrorNotification]);

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
    settings,
    updateSettings
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
