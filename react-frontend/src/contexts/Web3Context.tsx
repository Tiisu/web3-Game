// Enhanced Web3 Context for managing blockchain state and interactions

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { Web3ContextType, PlayerData, LeaderboardEntry } from '../types';
import { useWallet } from '../hooks/useWallet';
import { useGameContract } from '../hooks/useGameContract';
import { useNFTContract } from '../hooks/useNFTContract';
import { useNotifications } from '../hooks/useNotifications';
import { SUCCESS_MESSAGES, getCurrentContractAddresses, CONTRACT_ABIS } from '../config/web3Config';
import { debugWeb3Connection } from '../utils/web3Debug';

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
        console.log('Wallet connected successfully');
      }
      return success;
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError(err.message);
      return false;
    }
  }, [connectWallet]);

  // Disconnect wallet
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      await disconnectWallet();
      setPlayerData(null);
      setAchievements([]);
      setLeaderboard([]);
      setCurrentGameId(null);
      setError(null);
      console.log('Wallet disconnected successfully');
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, [disconnectWallet]);

  // Register player
  const registerPlayer = useCallback(async (username: string): Promise<void> => {
    if (!web3State.account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    setPendingTransaction({
      type: 'registration',
      message: 'Please sign the transaction to register your player...'
    });

    try {
      await gameContract.registerPlayer(username);
      setPendingTransaction(null);
      addSuccessNotification(SUCCESS_MESSAGES.PLAYER_REGISTERED);
      
      // Refresh data to get updated player info
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

  // Enhanced refresh with improved error handling and contract validation
  const refreshData = useCallback(async (retryCount: number = 0): Promise<void> => {
    if (!web3State.account) {
      console.log('No account connected, skipping data refresh');
      return;
    }

    if (!gameContract.isContractReady) {
      console.log('Contracts not ready, skipping data refresh');
      setError('Contracts not initialized. Please check your network connection.');
      return;
    }

    const maxRetries = 3;
    const retryDelay = 1000 * (retryCount + 1); // Exponential backoff

    if (retryCount === 0) {
      setIsLoading(true);
      setError(null);
    }

    try {
      console.log(`Refreshing Web3 data (attempt ${retryCount + 1}/${maxRetries + 1})...`);
      console.log(`Account: ${web3State.account}`);
      console.log(`Game Contract Ready: ${gameContract.isContractReady}`);

      // Load player data with improved error handling
      let playerDataLoaded = false;
      try {
        console.log('Loading player data...');
        const playerDataResult = await gameContract.getPlayerData(web3State.account);
        setPlayerData(playerDataResult);
        playerDataLoaded = true;
        console.log('Player data loaded successfully:', {
          username: playerDataResult.username,
          isRegistered: playerDataResult.isRegistered,
          totalGamesPlayed: playerDataResult.totalGamesPlayed,
          totalScore: playerDataResult.totalScore,
          highestScore: playerDataResult.highestScore
        });
      } catch (playerErr: any) {
        console.log('Player data error:', playerErr.message);
        
        // Check if it's a "player not registered" error vs a contract error
        if (playerErr.message.includes('not registered') || 
            playerErr.message.includes('Player does not exist') ||
            playerErr.message.includes('execution reverted')) {
          console.log('Player not registered, setting default data');
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
          playerDataLoaded = true;
        } else {
          console.error('Contract error loading player data:', playerErr);
          throw new Error(`Player data error: ${playerErr.message}`);
        }
      }

      // Load achievements with improved error handling
      let achievementsLoaded = false;
      try {
        console.log('Loading achievements...');
        const achievementsResult = await nftContract.getPlayerAchievements(web3State.account);
        setAchievements(achievementsResult || []);
        achievementsLoaded = true;
        console.log('Achievements loaded successfully:', achievementsResult?.length || 0, 'achievements');
      } catch (achievementErr: any) {
        console.log('Achievements error:', achievementErr.message);
        setAchievements([]);
        achievementsLoaded = true; // Consider this successful (empty array)
      }

      // Load leaderboard with improved error handling
      let leaderboardLoaded = false;
      try {
        console.log('Loading leaderboard...');
        const leaderboardResult = await gameContract.getLeaderboard();
        setLeaderboard(leaderboardResult || []);
        leaderboardLoaded = true;
        console.log('Leaderboard loaded successfully:', leaderboardResult?.length || 0, 'entries');
      } catch (leaderboardErr: any) {
        console.log('Leaderboard error:', leaderboardErr.message);
        setLeaderboard([]);
        leaderboardLoaded = true; // Consider this successful (empty array)
      }

      // Check if all data was loaded successfully
      if (playerDataLoaded && achievementsLoaded && leaderboardLoaded) {
        console.log('All Web3 data refreshed successfully');
        setError(null); // Clear any previous errors
      } else {
        throw new Error('Some data failed to load');
      }

    } catch (err: any) {
      console.error(`Failed to refresh Web3 data (attempt ${retryCount + 1}):`, err);

      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        setTimeout(() => {
          refreshData(retryCount + 1);
        }, retryDelay);
        return; // Don't set loading to false yet
      } else {
        console.error('Max retries reached, giving up');
        setError(`Failed to refresh data after ${maxRetries + 1} attempts: ${err.message}`);
      }
    } finally {
      // Only set loading to false if we're not retrying
      if (retryCount >= maxRetries || retryCount === 0) {
        setIsLoading(false);
      }
    }
  }, [web3State.account, gameContract, nftContract]);

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
    setPendingTransaction({
      type: 'gameComplete',
      message: 'Please sign the transaction to complete your game session...'
    });

    try {
      await gameContract.completeGameSession(gameId, score, molesHit, level);
      setCurrentGameId(null);
      setPendingTransaction(null);
      addSuccessNotification(SUCCESS_MESSAGES.GAME_SESSION_COMPLETED);

      // Refresh data to get updated stats and achievements
      console.log('Refreshing data after game completion...');
      await refreshData();
      console.log('Data refresh completed after game completion');
    } catch (err: any) {
      setPendingTransaction(null);
      setError(err.message);
      addErrorNotification(err.message);
      console.error('Failed to complete game session:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameContract, addSuccessNotification, addErrorNotification, refreshData]);

  // Clear pending transaction
  const clearPendingTransaction = useCallback(() => {
    setPendingTransaction(null);
  }, []);

  // Clear current game ID
  const clearCurrentGameId = useCallback(() => {
    setCurrentGameId(null);
  }, []);

  // Load data when wallet connects
  useEffect(() => {
    if (web3State.isConnected && web3State.account && gameContract.isContractReady) {
      console.log('Wallet connected, loading data...');
      
      // Run debug check first
      debugWeb3Connection().then(() => {
        refreshData();
      }).catch(err => {
        console.error('Debug check failed:', err);
        refreshData(); // Still try to refresh data
      });
    }
  }, [web3State.isConnected, web3State.account, gameContract.isContractReady, refreshData]);

  // Periodic refresh mechanism for real-time updates (disabled for now to prevent spam)
  // useEffect(() => {
  //   if (!web3State.isConnected || !web3State.account || !playerData?.isRegistered) {
  //     return;
  //   }

  //   console.log('Setting up periodic refresh for real-time updates...');

  //   // Refresh every 30 seconds for registered users
  //   const refreshInterval = setInterval(() => {
  //     console.log('Periodic refresh triggered...');
  //     refreshData();
  //   }, 30000);

  //   return () => {
  //     console.log('Cleaning up periodic refresh...');
  //     clearInterval(refreshInterval);
  //   };
  // }, [web3State.isConnected, web3State.account, playerData?.isRegistered, refreshData]);

  // Create enhanced web3State with additional data
  const enhancedWeb3State = {
    ...web3State,
    playerData,
    achievements,
    leaderboard,
    currentGameId
  };

  const contextValue: Web3ContextType = {
    web3State: enhancedWeb3State,
    connect,
    disconnect,
    registerPlayer,
    startGameSession,
    completeGameSession,
    refreshData,
    clearPendingTransaction,
    clearCurrentGameId,
    isLoading: isLoading || walletLoading,
    error: error || walletError,
    pendingTransaction
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;