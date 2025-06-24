// Custom hook for NFT contract interactions

import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { UseNFTContractReturn, AchievementMetadata, AchievementType } from '../types';
import { 
  CONTRACT_ABIS, 
  getCurrentContractAddresses, 
  ERROR_MESSAGES,
  isMetaMaskInstalled 
} from '../config/web3Config';

export const useNFTContract = (account: string | null): UseNFTContractReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get contract instance
  const nftContract = useMemo(() => {
    if (!account || !isMetaMaskInstalled()) {
      console.log('NFT contract not available: account or MetaMask not available');
      return null;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addresses = getCurrentContractAddresses();

      if (!addresses.NFT_CONTRACT || addresses.NFT_CONTRACT === '') {
        console.warn('NFT contract address not configured - Web3 features disabled');
        return null;
      }

      console.log('Creating NFT contract instance:', {
        address: addresses.NFT_CONTRACT,
        account: account
      });

      const contract = new ethers.Contract(
        addresses.NFT_CONTRACT,
        CONTRACT_ABIS.NFT_CONTRACT,
        signer
      );

      console.log('NFT contract instance created successfully');
      return contract;
    } catch (err) {
      console.error('Failed to create NFT contract instance:', err);
      setError(`Failed to initialize NFT contract: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [account]);

  // Get player achievements
  const getPlayerAchievements = useCallback(async (address: string): Promise<string[]> => {
    if (!nftContract) {
      console.log('NFT contract not available for achievements');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching achievements for address:', address);
      const achievements = await nftContract.getPlayerAchievements(address);
      console.log('Player achievements loaded:', achievements);
      return achievements || [];
    } catch (err: any) {
      console.error('Failed to get player achievements:', err);
      
      // For achievements, we can gracefully handle errors by returning empty array
      if (err.message.includes('execution reverted') || 
          err.message.includes('Player has no achievements') ||
          err.message.includes('not found')) {
        console.log('No achievements found or contract error, returning empty array');
        return [];
      }
      
      setError(err.message || 'Failed to fetch achievements');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [nftContract]);

  // Check if player has specific achievement
  const hasAchievement = useCallback(async (
    address: string, 
    achievement: AchievementType
  ): Promise<boolean> => {
    if (!nftContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
      const hasAch = await nftContract.hasAchievement(address, achievement);
      return hasAch;
    } catch (err: any) {
      console.error('Failed to check achievement:', err);
      return false;
    }
  }, [nftContract]);

  // Get achievement metadata
  const getAchievementMetadata = useCallback(async (
    achievement: AchievementType
  ): Promise<AchievementMetadata> => {
    if (!nftContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
      const metadata = await nftContract.getAchievementMetadata(achievement);
      
      return {
        name: metadata.name,
        description: metadata.description,
        imageURI: metadata.imageURI,
        totalMinted: metadata.totalMinted.toNumber(),
        exists: metadata.exists
      };
    } catch (err: any) {
      console.error('Failed to get achievement metadata:', err);
      throw new Error(err.message || 'Failed to fetch achievement metadata');
    }
  }, [nftContract]);

  // Get player's NFT balance
  const getPlayerNFTBalance = useCallback(async (address: string): Promise<number> => {
    if (!nftContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
      const balance = await nftContract.balanceOf(address);
      return balance.toNumber();
    } catch (err: any) {
      console.error('Failed to get NFT balance:', err);
      return 0;
    }
  }, [nftContract]);

  // Get player's NFT tokens
  const getPlayerNFTTokens = useCallback(async (address: string): Promise<number[]> => {
    if (!nftContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
      const balance = await getPlayerNFTBalance(address);
      const tokens: number[] = [];
      
      for (let i = 0; i < balance; i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
        tokens.push(tokenId.toNumber());
      }
      
      return tokens;
    } catch (err: any) {
      console.error('Failed to get NFT tokens:', err);
      return [];
    }
  }, [nftContract, getPlayerNFTBalance]);

  // Get token URI for a specific NFT
  const getTokenURI = useCallback(async (tokenId: number): Promise<string> => {
    if (!nftContract) {
      throw new Error(ERROR_MESSAGES.CONTRACT_INTERACTION_FAILED);
    }

    try {
      const uri = await nftContract.tokenURI(tokenId);
      return uri;
    } catch (err: any) {
      console.error('Failed to get token URI:', err);
      return '';
    }
  }, [nftContract]);

  // Get all achievement types
  const getAllAchievementTypes = useCallback((): AchievementType[] => {
    return ['BEGINNER', 'PRO', 'MASTER', 'REGULAR', 'VETERAN'];
  }, []);

  // Get achievement progress for a player
  const getAchievementProgress = useCallback(async (
    address: string,
    playerData: { totalScore: number; highestScore: number; totalGamesPlayed: number }
  ) => {
    const achievements = await getPlayerAchievements(address);
    const allTypes = getAllAchievementTypes();
    
    return allTypes.map(type => {
      const isUnlocked = achievements.includes(type);
      let progress = 0;
      let target = 0;
      
      switch (type) {
        case 'BEGINNER':
          target = 1000;
          progress = Math.min(playerData.highestScore, target);
          break;
        case 'PRO':
          target = 5000;
          progress = Math.min(playerData.highestScore, target);
          break;
        case 'MASTER':
          target = 10000;
          progress = Math.min(playerData.highestScore, target);
          break;
        case 'REGULAR':
          target = 10;
          progress = Math.min(playerData.totalGamesPlayed, target);
          break;
        case 'VETERAN':
          target = 100;
          progress = Math.min(playerData.totalGamesPlayed, target);
          break;
      }
      
      return {
        type,
        isUnlocked,
        progress,
        target,
        percentage: Math.round((progress / target) * 100)
      };
    });
  }, [getPlayerAchievements, getAllAchievementTypes]);

  return {
    getPlayerAchievements,
    hasAchievement,
    getAchievementMetadata,
    isLoading,
    error
  };
};
