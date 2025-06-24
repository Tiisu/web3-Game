// Custom hook for game contract interactions

import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { UseGameContractReturn, PlayerData, LeaderboardEntry } from '../types';
import { 
  CONTRACT_ABIS, 
  getCurrentContractAddresses, 
  ERROR_MESSAGES,
  isMetaMaskInstalled 
} from '../config/web3Config';

export const useGameContract = (account: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get contract instance
  const gameContract = useMemo(() => {
<<<<<<< HEAD
    if (!account || !isMetaMaskInstalled()) return null;
=======
    if (!account || !isMetaMaskInstalled()) {
      console.log('Game contract not available: account or MetaMask not available');
      return null;
    }
>>>>>>> master

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addresses = getCurrentContractAddresses();

      if (!addresses.GAME_CONTRACT || addresses.GAME_CONTRACT === '') {
        console.warn('Game contract address not configured - Web3 features disabled');
        return null;
      }

<<<<<<< HEAD
      return new ethers.Contract(
=======
      console.log('Creating game contract instance:', {
        address: addresses.GAME_CONTRACT,
        account: account
      });

      const contract = new ethers.Contract(
>>>>>>> master
        addresses.GAME_CONTRACT,
        CONTRACT_ABIS.GAME_CONTRACT,
        signer
      );
<<<<<<< HEAD
    } catch (err) {
      console.error('Failed to create game contract instance:', err);
=======

      console.log('Game contract instance created successfully');
      return contract;
    } catch (err) {
      console.error('Failed to create game contract instance:', err);
      setError(`Failed to initialize game contract: ${err instanceof Error ? err.message : 'Unknown error'}`);
>>>>>>> master
      return null;
    }
  }, [account]);

  // Register player
  const registerPlayer = useCallback(async (username: string): Promise<void> => {
    if (!gameContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await gameContract.registerPlayer(username);
      await tx.wait();
      
      console.log('Player registered successfully:', username);
    } catch (err: any) {
      console.error('Failed to register player:', err);
      
      if (err.code === 4001) {
        throw new Error(ERROR_MESSAGES.USER_REJECTED);
      } else if (err.code === -32603) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_FUNDS);
      } else {
        throw new Error(err.message || ERROR_MESSAGES.TRANSACTION_FAILED);
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameContract]);

  // Start game session
  const startGameSession = useCallback(async (): Promise<number> => {
    if (!gameContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await gameContract.startGame();
      const receipt = await tx.wait();
      
      // Extract game ID from event
      const gameStartedEvent = receipt.events?.find((e: any) => e.event === 'GameStarted');
      if (gameStartedEvent) {
        const gameId = gameStartedEvent.args.gameId.toNumber();
        console.log('Game session started:', gameId);
        return gameId;
      }
      
      throw new Error('Failed to get game ID from transaction');
    } catch (err: any) {
      console.error('Failed to start game session:', err);
      
      if (err.code === 4001) {
        throw new Error(ERROR_MESSAGES.USER_REJECTED);
      } else if (err.code === -32603) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_FUNDS);
      } else {
        throw new Error(err.message || ERROR_MESSAGES.GAME_SESSION_FAILED);
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameContract]);

  // Complete game session
  const completeGameSession = useCallback(async (
    gameId: number, 
    score: number, 
    molesHit: number, 
    level: number
  ): Promise<void> => {
    if (!gameContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await gameContract.completeGame(gameId, score, molesHit, level);
      await tx.wait();
      
      console.log('Game session completed:', { gameId, score, molesHit, level });
    } catch (err: any) {
      console.error('Failed to complete game session:', err);
      
      if (err.code === 4001) {
        throw new Error(ERROR_MESSAGES.USER_REJECTED);
      } else if (err.code === -32603) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_FUNDS);
      } else {
        throw new Error(err.message || ERROR_MESSAGES.TRANSACTION_FAILED);
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameContract]);

  // Get player data
  const getPlayerData = useCallback(async (address: string): Promise<PlayerData> => {
    if (!gameContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
<<<<<<< HEAD
      const playerData = await gameContract.getPlayer(address);
      
      return {
=======
      console.log('Fetching player data for address:', address);
      const playerData = await gameContract.getPlayer(address);
      
      console.log('Raw player data from contract:', playerData);
      
      const result = {
>>>>>>> master
        address: playerData.playerAddress,
        username: playerData.username,
        totalGamesPlayed: playerData.totalGamesPlayed.toNumber(),
        totalScore: playerData.totalScore.toNumber(),
        highestScore: playerData.highestScore.toNumber(),
        totalMolesHit: playerData.totalMolesHit.toNumber(),
        registrationTime: new Date(playerData.registrationTime.toNumber() * 1000),
        isRegistered: playerData.isRegistered
      };
<<<<<<< HEAD
    } catch (err: any) {
      console.error('Failed to get player data:', err);
=======
      
      console.log('Processed player data:', result);
      return result;
    } catch (err: any) {
      console.error('Failed to get player data:', err);
      
      // Check for specific error types
      if (err.message.includes('execution reverted') || 
          err.message.includes('Player does not exist') ||
          err.message.includes('not registered')) {
        // Return default data for unregistered player
        console.log('Player not registered, returning default data');
        return {
          address: address,
          username: '',
          totalGamesPlayed: 0,
          totalScore: 0,
          highestScore: 0,
          totalMolesHit: 0,
          registrationTime: new Date(),
          isRegistered: false
        };
      }
      
>>>>>>> master
      throw new Error(err.message || 'Failed to fetch player data');
    }
  }, [gameContract]);

  // Get leaderboard
  const getLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    if (!gameContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
<<<<<<< HEAD
      const leaderboardData = await gameContract.getLeaderboard();
      
      return leaderboardData.map((entry: any) => ({
=======
      console.log('Fetching leaderboard data...');
      const leaderboardData = await gameContract.getLeaderboard();
      
      console.log('Raw leaderboard data:', leaderboardData);
      
      const result = leaderboardData.map((entry: any) => ({
>>>>>>> master
        player: entry.player,
        username: entry.username,
        score: entry.score.toNumber(),
        timestamp: new Date(entry.timestamp.toNumber() * 1000)
      }));
<<<<<<< HEAD
    } catch (err: any) {
      console.error('Failed to get leaderboard:', err);
=======
      
      console.log('Processed leaderboard data:', result);
      return result;
    } catch (err: any) {
      console.error('Failed to get leaderboard:', err);
      
      // Return empty array for leaderboard errors (non-critical)
      if (err.message.includes('execution reverted')) {
        console.log('Leaderboard empty or contract error, returning empty array');
        return [];
      }
      
>>>>>>> master
      throw new Error(err.message || 'Failed to fetch leaderboard');
    }
  }, [gameContract]);

  // Get player rank
  const getPlayerRank = useCallback(async (address: string): Promise<number> => {
    if (!gameContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
      const rank = await gameContract.getPlayerRank(address);
      return rank.toNumber();
    } catch (err: any) {
      console.error('Failed to get player rank:', err);
      return 0;
    }
  }, [gameContract]);

  // Update username
  const updateUsername = useCallback(async (newUsername: string): Promise<void> => {
    if (!gameContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await gameContract.updateUsername(newUsername);
      await tx.wait();
      
      console.log('Username updated successfully:', newUsername);
    } catch (err: any) {
      console.error('Failed to update username:', err);
      
      if (err.code === 4001) {
        throw new Error(ERROR_MESSAGES.USER_REJECTED);
      } else if (err.code === -32603) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_FUNDS);
      } else {
        throw new Error(err.message || ERROR_MESSAGES.TRANSACTION_FAILED);
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameContract]);

  // Get game statistics
  const getGameStats = useCallback(async () => {
    if (!gameContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
      const [totalPlayers, totalGames, leaderboardSize] = await gameContract.getGameStats();
      
      return {
        totalPlayers: totalPlayers.toNumber(),
        totalGames: totalGames.toNumber(),
        leaderboardSize: leaderboardSize.toNumber()
      };
    } catch (err: any) {
      console.error('Failed to get game stats:', err);
      throw new Error(err.message || 'Failed to fetch game statistics');
    }
  }, [gameContract]);

  return {
    registerPlayer,
    startGameSession,
    completeGameSession,
    getPlayerData,
    getLeaderboard,
    getPlayerRank,
    updateUsername,
    getGameStats,
    isLoading,
    error,
    isContractReady: !!gameContract
  };
};
