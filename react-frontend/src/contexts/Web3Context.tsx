// Web3 Context for managing blockchain state and interactions

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { Web3ContextType, PlayerData, LeaderboardEntry } from '../types';
import { useWallet } from '../hooks/useWallet';
import { useGameContract } from '../hooks/useGameContract';
import { useNFTContract } from '../hooks/useNFTContract';
import { useNotifications } from '../hooks/useNotifications';
import { SUCCESS_MESSAGES, getCurrentContractAddresses, CONTRACT_ABIS } from '../config/web3Config';

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

  // Clear current game ID (utility function)
  const clearCurrentGameId = useCallback(() => {
    setCurrentGameId(null);
    console.log('🧹 Cleared current game ID');
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

  // Enhanced refresh with retry mechanism
  const refreshData = useCallback(async (retryCount: number = 0): Promise<void> => {
    if (!web3State.account) {
      return;
    }

    const maxRetries = 3;
    const retryDelay = 1000 * (retryCount + 1); // Exponential backoff

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Refreshing Web3 data (attempt ${retryCount + 1}/${maxRetries + 1})...`);

      // Load player data with retry logic
      let playerDataLoaded = false;
      try {
        const playerDataResult = await gameContract.getPlayerData(web3State.account);
        setPlayerData(playerDataResult);
        playerDataLoaded = true;
        console.log('✅ Player data loaded successfully:', playerDataResult);
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
        playerDataLoaded = true; // Consider this successful for unregistered users
      }

      // Load achievements with retry logic
      let achievementsLoaded = false;
      try {
        const achievementsResult = await nftContract.getPlayerAchievements(web3State.account);
        setAchievements(achievementsResult);
        achievementsLoaded = true;
        console.log('✅ Achievements loaded successfully:', achievementsResult);
      } catch (achievementErr: any) {
        console.log('Failed to load achievements:', achievementErr.message);
        setAchievements([]);
        achievementsLoaded = true; // Consider this successful (empty array)
      }

      // Load leaderboard with retry logic
      let leaderboardLoaded = false;
      try {
        const leaderboardResult = await gameContract.getLeaderboard();
        setLeaderboard(leaderboardResult);
        leaderboardLoaded = true;
        console.log('✅ Leaderboard loaded successfully:', leaderboardResult.length, 'entries');
      } catch (leaderboardErr: any) {
        console.log('Failed to load leaderboard:', leaderboardErr.message);
        setLeaderboard([]);
        leaderboardLoaded = true; // Consider this successful (empty array)
      }

      // Check if all data was loaded successfully
      if (playerDataLoaded && achievementsLoaded && leaderboardLoaded) {
        console.log('✅ All Web3 data refreshed successfully');
      } else {
        throw new Error('Some data failed to load');
      }

    } catch (err: any) {
      console.error(`❌ Failed to refresh Web3 data (attempt ${retryCount + 1}):`, err);

      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay}ms...`);
        setTimeout(() => {
          refreshData(retryCount + 1);
        }, retryDelay);
        return; // Don't set loading to false yet
      } else {
        console.error('❌ Max retries reached, giving up');
        setError(`Failed to refresh data after ${maxRetries + 1} attempts: ${err.message}`);
      }
    } finally {
      // Only set loading to false if we're not retrying
      if (retryCount >= maxRetries) {
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
      console.log('🔄 Refreshing data after game completion...');
      await refreshData();
      console.log('✅ Data refresh completed after game completion');
    } catch (err: any) {
      setPendingTransaction(null);
      setError(err.message);
      addErrorNotification(err.message);
      console.error('❌ Failed to complete game session:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameContract, addSuccessNotification, addErrorNotification, refreshData]);

  // Load data when wallet connects
  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      refreshData();
    }
  }, [web3State.isConnected, web3State.account]); // Removed refreshData from dependencies to prevent infinite loop

  // Periodic refresh mechanism for real-time updates
  useEffect(() => {
    if (!web3State.isConnected || !web3State.account || !web3State.playerData?.isRegistered) {
      return;
    }

    console.log('⏰ Setting up periodic refresh for real-time updates...');

    // Refresh every 30 seconds for registered users
    const refreshInterval = setInterval(() => {
      console.log('⏰ Periodic refresh triggered...');
      refreshData();
    }, 30000);

    return () => {
      console.log('🧹 Cleaning up periodic refresh...');
      clearInterval(refreshInterval);
    };
  }, [web3State.isConnected, web3State.account, web3State.playerData?.isRegistered, refreshData]);

  // Set up contract event listeners
  useEffect(() => {
    if (!web3State.account || !gameContract.isContractReady) return;

    console.log('🎧 Setting up contract event listeners...');

    // Create contract instance for event listening
    let gameContractInstance: ethers.Contract | null = null;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const addresses = getCurrentContractAddresses();

      if (addresses.GAME_CONTRACT && addresses.GAME_CONTRACT !== '') {
        gameContractInstance = new ethers.Contract(
          addresses.GAME_CONTRACT,
          CONTRACT_ABIS.GAME_CONTRACT,
          provider
        );
      }
    } catch (error) {
      console.error('❌ Failed to create contract instances for event listening:', error);
      return;
    }

    if (!gameContractInstance) {
      console.warn('Game contract instance not available for event listening');
      return;
    }

    // Listen for game completion events
    const handleGameCompleted = (player: string, gameId: any, score: any, event: any) => {
      console.log('🎮 GameCompleted event received:', { player, gameId: gameId.toString(), score: score.toString() });
      if (player.toLowerCase() === web3State.account?.toLowerCase()) {
        console.log('🔄 Refreshing data due to GameCompleted event...');
        refreshData();
      }
    };

    // Listen for player registration events
    const handlePlayerRegistered = (player: string, username: string, event: any) => {
      console.log('👤 PlayerRegistered event received:', { player, username });
      if (player.toLowerCase() === web3State.account?.toLowerCase()) {
        console.log('🔄 Refreshing data due to PlayerRegistered event...');
        refreshData();
      }
    };

    // Listen for achievement unlock events
    const handleAchievementUnlocked = (player: string, achievement: string, event: any) => {
      console.log('🏆 AchievementUnlocked event received:', { player, achievement });
      if (player.toLowerCase() === web3State.account?.toLowerCase()) {
        console.log('🔄 Refreshing data due to AchievementUnlocked event...');
        addAchievementNotification(`Achievement unlocked: ${achievement}!`);
        refreshData();
      }
    };

    // Listen for leaderboard update events
    const handleLeaderboardUpdated = (player: string, score: any, position: any, event: any) => {
      console.log('📋 LeaderboardUpdated event received:', { player, score: score.toString(), position: position.toString() });
      // Refresh leaderboard for all users when anyone updates it
      console.log('🔄 Refreshing data due to LeaderboardUpdated event...');
      refreshData();

      if (player.toLowerCase() === web3State.account?.toLowerCase()) {
        addSuccessNotification(`You're now ranked #${position.toString()} with ${score.toString()} points!`);
      }
    };

    try {
      // Set up event listeners on game contract
      gameContractInstance.on('GameCompleted', handleGameCompleted);
      gameContractInstance.on('PlayerRegistered', handlePlayerRegistered);
      gameContractInstance.on('LeaderboardUpdated', handleLeaderboardUpdated);
      gameContractInstance.on('AchievementUnlocked', handleAchievementUnlocked);

      console.log('✅ Contract event listeners set up successfully');
    } catch (error) {
      console.error('❌ Failed to set up event listeners:', error);
    }

    return () => {
      // Cleanup event listeners
      console.log('🧹 Cleaning up contract event listeners...');
      try {
        if (gameContractInstance) {
          gameContractInstance.off('GameCompleted', handleGameCompleted);
          gameContractInstance.off('PlayerRegistered', handlePlayerRegistered);
          gameContractInstance.off('LeaderboardUpdated', handleLeaderboardUpdated);
          gameContractInstance.off('AchievementUnlocked', handleAchievementUnlocked);
        }
      } catch (error) {
        console.error('❌ Failed to cleanup event listeners:', error);
      }
    };
  }, [web3State.account, gameContract.isContractReady, refreshData, addSuccessNotification, addErrorNotification]);

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
    clearCurrentGameId,
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
