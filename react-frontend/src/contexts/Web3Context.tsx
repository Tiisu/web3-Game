// Web3 Context for managing blockchain state and interactions

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Web3ContextType, PlayerData, LeaderboardEntry } from '../types';
import { useWallet } from '../hooks/useWallet';
import { useGameContract } from '../hooks/useGameContract';
import { useNFTContract } from '../hooks/useNFTContract';
import { useNotifications } from '../hooks/useNotifications';
import { SUCCESS_MESSAGES } from '../config/web3Config';

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { web3State, connect: connectWallet, disconnect: disconnectWallet, isLoading: walletLoading, error: walletError } = useWallet();
  const gameContract = useGameContract(web3State.account);
  const nftContract = useNFTContract(web3State.account);
  const { addSuccessNotification, addErrorNotification, addAchievementNotification, addLeaderboardNotification } = useNotifications();

  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transaction state management
  const [pendingTransaction, setPendingTransaction] = useState<{
    type: 'registration' | 'gameStart' | 'gameComplete';
    message: string;
  } | null>(null);

  // Connect wallet
  const connect = useCallback(async (): Promise<boolean> => {
    try {
      const success = await connectWallet();
      if (success) {
        addSuccessNotification(SUCCESS_MESSAGES.WALLET_CONNECTED);
        return true;
      }
      return false;
    } catch (err: any) {
      addErrorNotification(err.message);
      return false;
    }
  }, [connectWallet, addSuccessNotification, addErrorNotification]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    disconnectWallet();
    setPlayerData(null);
    setAchievements([]);
    setLeaderboard([]);
    setCurrentGameId(null);
    setPendingTransaction(null); // Clear any pending transactions
  }, [disconnectWallet]);

  // Clear pending transaction (utility function)
  const clearPendingTransaction = useCallback(() => {
    setPendingTransaction(null);
  }, []);

  // Register player
  const registerPlayer = useCallback(async (username: string): Promise<void> => {
    if (!web3State.account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    setPendingTransaction({
      type: 'registration',
      message: 'Please sign the transaction to register your player profile...'
    });

    try {
      await gameContract.registerPlayer(username);
      setPendingTransaction(null);
      addSuccessNotification(SUCCESS_MESSAGES.PLAYER_REGISTERED);

      // Refresh player data
      await refreshData();
    } catch (err: any) {
      setPendingTransaction(null);
      setError(err.message);
      addErrorNotification(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameContract, addSuccessNotification, addErrorNotification]);

  // Start game session
  const startGameSession = useCallback(async (): Promise<number> => {
    if (!web3State.account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    setPendingTransaction({
      type: 'gameStart',
      message: 'Please sign the transaction to start your game session...'
    });

    try {
      const gameId = await gameContract.startGameSession();
      setCurrentGameId(gameId);
      setPendingTransaction(null);
      addSuccessNotification(SUCCESS_MESSAGES.GAME_SESSION_STARTED);
      return gameId;
    } catch (err: any) {
      setPendingTransaction(null);
      setError(err.message);
      addErrorNotification(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameContract, addSuccessNotification, addErrorNotification]);

  // Complete game session
  const completeGameSession = useCallback(async (
    gameId: number,
    score: number,
    molesHit: number,
    level: number
  ): Promise<void> => {
    if (!web3State.account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      await gameContract.completeGameSession(gameId, score, molesHit, level);
      setCurrentGameId(null);
      addSuccessNotification(SUCCESS_MESSAGES.GAME_SESSION_COMPLETED);
      
      // Refresh data to get updated stats and achievements
      await refreshData();
    } catch (err: any) {
      setError(err.message);
      addErrorNotification(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameContract, addSuccessNotification, addErrorNotification]);

  // Refresh all Web3 data
  const refreshData = useCallback(async (): Promise<void> => {
    if (!web3State.account) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load player data - handle unregistered players gracefully
      try {
        const playerDataResult = await gameContract.getPlayerData(web3State.account);
        setPlayerData(playerDataResult);
      } catch (playerErr: any) {
        console.log('Player not registered yet or failed to load player data:', playerErr.message);
        // Set default player data for unregistered player
        setPlayerData({
          address: web3State.account,
          username: '',
          totalGamesPlayed: 0,
          totalScore: 0,
          highestScore: 0,
          totalMolesHit: 0,
          registrationTime: new Date(),
          isRegistered: false
        });
      }

      // Only load achievements and leaderboard if we have a valid contract connection
      try {
        const achievementsResult = await nftContract.getPlayerAchievements(web3State.account);
        setAchievements(achievementsResult);
      } catch (achievementErr: any) {
        console.log('Failed to load achievements:', achievementErr.message);
        setAchievements([]);
      }

      try {
        const leaderboardResult = await gameContract.getLeaderboard();
        setLeaderboard(leaderboardResult);
      } catch (leaderboardErr: any) {
        console.log('Failed to load leaderboard:', leaderboardErr.message);
        setLeaderboard([]);
      }

    } catch (err: any) {
      console.error('Failed to refresh Web3 data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [web3State.account, gameContract, nftContract]);

  // Load data when wallet connects
  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      refreshData();
    }
  }, [web3State.isConnected, web3State.account]); // Removed refreshData from dependencies to prevent infinite loop

  // Set up contract event listeners
  useEffect(() => {
    if (!web3State.account) return;

    // Note: In a real implementation, you would set up event listeners here
    // For now, we'll rely on manual refresh after transactions

    return () => {
      // Cleanup event listeners
    };
  }, [web3State.account]);

  // Combine loading states
  const combinedLoading = walletLoading || gameContract.isLoading || nftContract.isLoading || isLoading;

  // Combine errors
  const combinedError = walletError || gameContract.error || nftContract.error || error;

  const contextValue: Web3ContextType = {
    web3State: {
      ...web3State,
      playerData,
      achievements,
      leaderboard,
      currentGameId
    },
    connect,
    disconnect,
    registerPlayer,
    startGameSession,
    completeGameSession,
    refreshData,
    clearPendingTransaction,
    isLoading: combinedLoading,
    error: combinedError,
    pendingTransaction
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};
