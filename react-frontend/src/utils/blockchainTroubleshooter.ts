// Blockchain Troubleshooter and Fix Utilities

import { ethers } from 'ethers';
import { getCurrentContractAddresses, CONTRACT_ABIS, NETWORKS } from '../config/web3Config';

export interface TroubleshootResult {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  solution: string;
  autoFixAvailable: boolean;
  autoFix?: () => Promise<boolean>;
}

export class BlockchainTroubleshooter {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
    }
  }

  async runFullTroubleshooting(): Promise<TroubleshootResult[]> {
    const issues: TroubleshootResult[] = [];

    console.log('🔍 Running comprehensive blockchain troubleshooting...');

    // Check network connection
    const networkIssues = await this.checkNetworkIssues();
    issues.push(...networkIssues);

    // Check contract deployment
    const contractIssues = await this.checkContractIssues();
    issues.push(...contractIssues);

    // Check wallet connection
    const walletIssues = await this.checkWalletIssues();
    issues.push(...walletIssues);

    // Check gas and balance issues
    const gasIssues = await this.checkGasIssues();
    issues.push(...gasIssues);

    // Check data loading issues
    const dataIssues = await this.checkDataLoadingIssues();
    issues.push(...dataIssues);

    return issues;
  }

  private async checkNetworkIssues(): Promise<TroubleshootResult[]> {
    const issues: TroubleshootResult[] = [];

    try {
      if (!this.provider) {
        issues.push({
          issue: 'No Web3 Provider',
          severity: 'critical',
          description: 'MetaMask or another Web3 wallet is not detected',
          solution: 'Install MetaMask browser extension and refresh the page',
          autoFixAvailable: false
        });
        return issues;
      }

      const network = await this.provider.getNetwork();
      const expectedChainId = parseInt(NETWORKS.APECHAIN_TESTNET.chainId, 16);

      if (network.chainId !== expectedChainId) {
        issues.push({
          issue: 'Wrong Network',
          severity: 'high',
          description: `Connected to chain ${network.chainId}, but expected ${expectedChainId} (ApeChain Testnet)`,
          solution: 'Switch to ApeChain Testnet in your wallet',
          autoFixAvailable: true,
          autoFix: async () => {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: NETWORKS.APECHAIN_TESTNET.chainId }],
              });
              return true;
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                // Network not added, try to add it
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [NETWORKS.APECHAIN_TESTNET],
                  });
                  return true;
                } catch (addError) {
                  console.error('Failed to add network:', addError);
                  return false;
                }
              }
              return false;
            }
          }
        });
      }

      // Check if network is responsive
      try {
        await this.provider.getBlockNumber();
      } catch (error) {
        issues.push({
          issue: 'Network Unresponsive',
          severity: 'high',
          description: 'Cannot connect to the blockchain network',
          solution: 'Check your internet connection and try again',
          autoFixAvailable: false
        });
      }

    } catch (error: any) {
      issues.push({
        issue: 'Network Connection Error',
        severity: 'high',
        description: error.message,
        solution: 'Check your wallet connection and network settings',
        autoFixAvailable: false
      });
    }

    return issues;
  }

  private async checkContractIssues(): Promise<TroubleshootResult[]> {
    const issues: TroubleshootResult[] = [];

    try {
      const addresses = getCurrentContractAddresses();

      if (!addresses.GAME_CONTRACT || addresses.GAME_CONTRACT === '') {
        issues.push({
          issue: 'Game Contract Not Configured',
          severity: 'critical',
          description: 'Game contract address is missing from configuration',
          solution: 'Update the contract addresses in web3Config.ts',
          autoFixAvailable: false
        });
      }

      if (!addresses.NFT_CONTRACT || addresses.NFT_CONTRACT === '') {
        issues.push({
          issue: 'NFT Contract Not Configured',
          severity: 'critical',
          description: 'NFT contract address is missing from configuration',
          solution: 'Update the contract addresses in web3Config.ts',
          autoFixAvailable: false
        });
      }

      if (this.provider && addresses.GAME_CONTRACT) {
        const gameCode = await this.provider.getCode(addresses.GAME_CONTRACT);
        if (!gameCode || gameCode === '0x') {
          issues.push({
            issue: 'Game Contract Not Deployed',
            severity: 'critical',
            description: `No contract found at address ${addresses.GAME_CONTRACT}`,
            solution: 'Deploy the game contract or update the address',
            autoFixAvailable: false
          });
        }
      }

      if (this.provider && addresses.NFT_CONTRACT) {
        const nftCode = await this.provider.getCode(addresses.NFT_CONTRACT);
        if (!nftCode || nftCode === '0x') {
          issues.push({
            issue: 'NFT Contract Not Deployed',
            severity: 'critical',
            description: `No contract found at address ${addresses.NFT_CONTRACT}`,
            solution: 'Deploy the NFT contract or update the address',
            autoFixAvailable: false
          });
        }
      }

    } catch (error: any) {
      issues.push({
        issue: 'Contract Check Failed',
        severity: 'medium',
        description: error.message,
        solution: 'Check contract addresses and network connection',
        autoFixAvailable: false
      });
    }

    return issues;
  }

  private async checkWalletIssues(): Promise<TroubleshootResult[]> {
    const issues: TroubleshootResult[] = [];

    try {
      if (!this.provider) return issues;

      const accounts = await this.provider.listAccounts();
      if (accounts.length === 0) {
        issues.push({
          issue: 'Wallet Not Connected',
          severity: 'high',
          description: 'No wallet account is connected',
          solution: 'Connect your wallet to the application',
          autoFixAvailable: true,
          autoFix: async () => {
            try {
              await window.ethereum.request({ method: 'eth_requestAccounts' });
              return true;
            } catch (error) {
              return false;
            }
          }
        });
      }

    } catch (error: any) {
      issues.push({
        issue: 'Wallet Connection Error',
        severity: 'medium',
        description: error.message,
        solution: 'Check your wallet extension and try reconnecting',
        autoFixAvailable: false
      });
    }

    return issues;
  }

  private async checkGasIssues(): Promise<TroubleshootResult[]> {
    const issues: TroubleshootResult[] = [];

    try {
      if (!this.provider || !this.signer) return issues;

      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);

      if (balance.isZero()) {
        issues.push({
          issue: 'No Balance',
          severity: 'high',
          description: 'Wallet has no APE tokens for gas fees',
          solution: 'Get some APE tokens from a faucet or exchange',
          autoFixAvailable: false
        });
      } else if (parseFloat(balanceInEth) < 0.001) {
        issues.push({
          issue: 'Low Balance',
          severity: 'medium',
          description: `Wallet has very low balance: ${balanceInEth} APE`,
          solution: 'Consider adding more APE tokens for gas fees',
          autoFixAvailable: false
        });
      }

    } catch (error: any) {
      issues.push({
        issue: 'Balance Check Failed',
        severity: 'low',
        description: error.message,
        solution: 'Check wallet connection',
        autoFixAvailable: false
      });
    }

    return issues;
  }

  private async checkDataLoadingIssues(): Promise<TroubleshootResult[]> {
    const issues: TroubleshootResult[] = [];

    try {
      if (!this.provider || !this.signer) return issues;

      const addresses = getCurrentContractAddresses();
      if (!addresses.GAME_CONTRACT || !addresses.NFT_CONTRACT) return issues;

      const gameContract = new ethers.Contract(
        addresses.GAME_CONTRACT,
        CONTRACT_ABIS.GAME_CONTRACT,
        this.signer
      );

      const nftContract = new ethers.Contract(
        addresses.NFT_CONTRACT,
        CONTRACT_ABIS.NFT_CONTRACT,
        this.signer
      );

      const address = await this.signer.getAddress();

      // Test player data loading
      try {
        await gameContract.getPlayer(address);
      } catch (error: any) {
        if (!error.message.includes('not registered') && !error.message.includes('execution reverted')) {
          issues.push({
            issue: 'Player Data Loading Failed',
            severity: 'medium',
            description: `Cannot load player data: ${error.message}`,
            solution: 'Check contract ABI and network connection',
            autoFixAvailable: false
          });
        }
      }

      // Test leaderboard loading
      try {
        await gameContract.getLeaderboard();
      } catch (error: any) {
        issues.push({
          issue: 'Leaderboard Loading Failed',
          severity: 'medium',
          description: `Cannot load leaderboard: ${error.message}`,
          solution: 'Check contract function and network connection',
          autoFixAvailable: false
        });
      }

      // Test NFT functionality
      try {
        await nftContract.getPlayerAchievements(address);
      } catch (error: any) {
        issues.push({
          issue: 'NFT Data Loading Failed',
          severity: 'medium',
          description: `Cannot load achievements: ${error.message}`,
          solution: 'Check NFT contract and network connection',
          autoFixAvailable: false
        });
      }

    } catch (error: any) {
      issues.push({
        issue: 'Data Loading Test Failed',
        severity: 'low',
        description: error.message,
        solution: 'Check overall system configuration',
        autoFixAvailable: false
      });
    }

    return issues;
  }

  async autoFixIssues(issues: TroubleshootResult[]): Promise<{ fixed: number; failed: number }> {
    let fixed = 0;
    let failed = 0;

    for (const issue of issues) {
      if (issue.autoFixAvailable && issue.autoFix) {
        try {
          console.log(`🔧 Attempting to fix: ${issue.issue}`);
          const success = await issue.autoFix();
          if (success) {
            console.log(`✅ Fixed: ${issue.issue}`);
            fixed++;
          } else {
            console.log(`❌ Failed to fix: ${issue.issue}`);
            failed++;
          }
        } catch (error) {
          console.error(`❌ Error fixing ${issue.issue}:`, error);
          failed++;
        }
      }
    }

    return { fixed, failed };
  }

  // Helper method to check if NFT minting is working
  async testNFTMinting(address: string): Promise<boolean> {
    try {
      const addresses = getCurrentContractAddresses();
      if (!addresses.NFT_CONTRACT || !this.signer) return false;

      const nftContract = new ethers.Contract(
        addresses.NFT_CONTRACT,
        CONTRACT_ABIS.NFT_CONTRACT,
        this.signer
      );

      // Check if player has any achievements
      const achievements = await nftContract.getPlayerAchievements(address);
      console.log('Player achievements:', achievements);

      // Check achievement metadata
      const achievementTypes = ['BEGINNER', 'PRO', 'MASTER', 'REGULAR', 'VETERAN'];
      for (const type of achievementTypes) {
        try {
          const metadata = await nftContract.getAchievementMetadata(type);
          console.log(`${type} metadata:`, metadata);
        } catch (error) {
          console.log(`${type} metadata not found or error:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('NFT minting test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const blockchainTroubleshooter = new BlockchainTroubleshooter();