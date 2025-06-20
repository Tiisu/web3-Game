// Custom hook for wallet connection and management

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { UseWalletReturn, Web3State } from '../types';
import { 
  getCurrentNetworkConfig, 
  isMetaMaskInstalled, 
  getChainIdAsNumber,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../config/web3Config';

export const useWallet = (): UseWalletReturn => {
  const [web3State, setWeb3State] = useState<Web3State>({
    isInitialized: false,
    isConnected: false,
    account: null,
    chainId: null,
    playerData: null,
    achievements: [],
    leaderboard: [],
    currentGameId: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Web3 provider
  const initializeProvider = useCallback(async (): Promise<ethers.providers.Web3Provider | null> => {
    if (!isMetaMaskInstalled()) {
      setError(ERROR_MESSAGES.WALLET_NOT_FOUND);
      return null;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return provider;
    } catch (err) {
      console.error('Failed to initialize provider:', err);
      setError(ERROR_MESSAGES.WALLET_CONNECTION_FAILED);
      return null;
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isMetaMaskInstalled()) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = await initializeProvider();
      if (!provider) {
        throw new Error(ERROR_MESSAGES.WALLET_CONNECTION_FAILED);
      }

      // Get account and network info
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check if we're on the correct network
      const targetNetwork = getCurrentNetworkConfig();
      const targetChainId = getChainIdAsNumber(targetNetwork.chainId);

      if (network.chainId !== targetChainId) {
        const switched = await switchNetwork(targetChainId);
        if (!switched) {
          throw new Error(ERROR_MESSAGES.NETWORK_SWITCH_FAILED);
        }
      }

      setWeb3State(prev => ({
        ...prev,
        isInitialized: true,
        isConnected: true,
        account: accounts[0],
        chainId: network.chainId
      }));

      // Set up event listeners
      setupEventListeners();

      setIsLoading(false);
      return true;

    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      setError(err.message || ERROR_MESSAGES.WALLET_CONNECTION_FAILED);
      setIsLoading(false);
      return false;
    }
  }, [initializeProvider]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWeb3State({
      isInitialized: false,
      isConnected: false,
      account: null,
      chainId: null,
      playerData: null,
      achievements: [],
      leaderboard: [],
      currentGameId: null
    });
    
    // Remove event listeners
    if (window.ethereum) {
      // Note: Event listeners will be cleaned up when component unmounts
      // or when setupEventListeners cleanup function is called
    }
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (chainId: number): Promise<boolean> => {
    if (!window.ethereum) return false;

    try {
      const targetNetwork = getCurrentNetworkConfig();
      
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });

      return true;

    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const targetNetwork = getCurrentNetworkConfig();
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetNetwork],
          });

          return true;

        } catch (addError) {
          console.error('Failed to add network:', addError);
          return false;
        }
      } else {
        console.error('Failed to switch network:', switchError);
        return false;
      }
    }
  }, []);

  // Set up event listeners for account and network changes
  const setupEventListeners = useCallback(() => {
    if (!window.ethereum) return;

    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWeb3State(prev => ({
          ...prev,
          account: accounts[0]
        }));
      }
    };

    // Handle chain changes
    const handleChainChanged = (chainId: string) => {
      const numericChainId = parseInt(chainId, 16);
      setWeb3State(prev => ({
        ...prev,
        chainId: numericChainId
      }));

      // Check if we're on the correct network
      const targetNetwork = getCurrentNetworkConfig();
      const targetChainId = getChainIdAsNumber(targetNetwork.chainId);
      
      if (numericChainId !== targetChainId) {
        setError('Please switch to ApeChain network');
      } else {
        setError(null);
      }
    };

    // Handle disconnect
    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [disconnect]);

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const provider = await initializeProvider();
        if (!provider) return;

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          
          setWeb3State(prev => ({
            ...prev,
            isInitialized: true,
            isConnected: true,
            account: accounts[0],
            chainId: network.chainId
          }));

          setupEventListeners();
        }
      } catch (err) {
        console.error('Failed to check existing connection:', err);
      }
    };

    checkConnection();
  }, [initializeProvider, setupEventListeners]);

  // Update Web3 state
  const updateWeb3State = useCallback((updates: Partial<Web3State>) => {
    setWeb3State(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    web3State,
    connect,
    disconnect,
    switchNetwork,
    isLoading,
    error
  };
};
