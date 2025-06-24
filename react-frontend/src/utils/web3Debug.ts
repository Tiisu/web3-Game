// Simple Web3 debugging utilities

import { ethers } from 'ethers';
import { getCurrentContractAddresses, getCurrentNetworkConfig, CONTRACT_ABIS } from '../config/web3Config';

export async function debugWeb3Connection(): Promise<void> {
  console.log('=== Web3 Connection Debug ===');
  
  try {
    // Check MetaMask
    if (!window.ethereum) {
      console.error('MetaMask not detected');
      return;
    }
    console.log('MetaMask detected');

    // Check network
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    const networkConfig = getCurrentNetworkConfig();
    const expectedChainId = parseInt(networkConfig.chainId, 16);
    
    console.log('Current network:', {
      chainId: network.chainId,
      name: network.name,
      expected: expectedChainId
    });

    if (network.chainId !== expectedChainId) {
      console.warn('Wrong network! Expected:', expectedChainId, 'Got:', network.chainId);
    }

    // Check contract addresses
    const addresses = getCurrentContractAddresses();
    console.log('Contract addresses:', addresses);

    // Test game contract
    if (addresses.GAME_CONTRACT) {
      const gameCode = await provider.getCode(addresses.GAME_CONTRACT);
      if (gameCode === '0x') {
        console.error('Game contract not deployed at:', addresses.GAME_CONTRACT);
      } else {
        console.log('Game contract found, code length:', gameCode.length);
        
        // Test basic call
        try {
          const gameContract = new ethers.Contract(
            addresses.GAME_CONTRACT,
            CONTRACT_ABIS.GAME_CONTRACT,
            provider
          );
          const stats = await gameContract.getGameStats();
          console.log('Game contract stats:', {
            totalPlayers: stats[0].toString(),
            totalGames: stats[1].toString(),
            leaderboardSize: stats[2].toString()
          });
        } catch (err) {
          console.error('Game contract call failed:', err);
        }
      }
    }

    // Test NFT contract
    if (addresses.NFT_CONTRACT) {
      const nftCode = await provider.getCode(addresses.NFT_CONTRACT);
      if (nftCode === '0x') {
        console.error('NFT contract not deployed at:', addresses.NFT_CONTRACT);
      } else {
        console.log('NFT contract found, code length:', nftCode.length);
      }
    }

  } catch (error) {
    console.error('Debug failed:', error);
  }
  
  console.log('=== Debug Complete ===');
}

// Call this function to debug Web3 connection issues
export function runDebug(): void {
  debugWeb3Connection().catch(console.error);
}