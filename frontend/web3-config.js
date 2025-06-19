// Web3 Configuration for Whac-A-Mole dApp

// Ape Chain Network Configuration
const NETWORKS = {
  APECHAIN_TESTNET: {
    chainId: '0x8157', // 33111 in hex
    chainName: 'Curtis (Ape Chain Testnet)',
    nativeCurrency: {
      name: 'APE',
      symbol: 'APE',
      decimals: 18
    },
    rpcUrls: ['https://curtis.rpc.caldera.xyz/http'],
    blockExplorerUrls: ['https://curtis.explorer.caldera.xyz/']
  },
  APECHAIN_MAINNET: {
    chainId: '0x8173', // 33139 in hex
    chainName: 'ApeChain',
    nativeCurrency: {
      name: 'APE',
      symbol: 'APE',
      decimals: 18
    },
    rpcUrls: ['https://apechain.calderachain.xyz/http'],
    blockExplorerUrls: ['https://apechain.calderaexplorer.xyz/']
  }
};

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESSES = {
  TESTNET: {
    GAME_CONTRACT: '', // Will be filled after deployment
    NFT_CONTRACT: ''   // Will be filled after deployment
  },
  MAINNET: {
    GAME_CONTRACT: '', // Will be filled after deployment
    NFT_CONTRACT: ''   // Will be filled after deployment
  }
};

// Contract ABIs (simplified for frontend use)
const CONTRACT_ABIS = {
  GAME_CONTRACT: [
    // Player registration
    "function registerPlayer(string memory _username) external",
    "function getPlayer(address _player) external view returns (tuple(address playerAddress, string username, uint256 totalGamesPlayed, uint256 totalScore, uint256 highestScore, uint256 totalMolesHit, uint256 registrationTime, bool isRegistered))",
    
    // Game sessions
    "function startGame() external returns (uint256)",
    "function completeGame(uint256 _gameId, uint256 _score, uint256 _molesHit, uint256 _level) external",
    "function getGameSession(uint256 _gameId) external view returns (tuple(address player, uint256 score, uint256 molesHit, uint256 level, uint256 startTime, uint256 endTime, bool isCompleted))",
    
    // Leaderboard
    "function getLeaderboard() external view returns (tuple(address player, string username, uint256 score, uint256 timestamp)[])",
    "function getPlayerRank(address _player) external view returns (uint256)",
    
    // Statistics
    "function getGameStats() external view returns (uint256 totalPlayers, uint256 totalGames, uint256 leaderboardSize)",
    
    // Username update
    "function updateUsername(string memory _newUsername) external",
    
    // Events
    "event PlayerRegistered(address indexed player, string username)",
    "event GameStarted(address indexed player, uint256 indexed gameId)",
    "event GameCompleted(address indexed player, uint256 indexed gameId, uint256 score)",
    "event LeaderboardUpdated(address indexed player, uint256 score, uint256 position)",
    "event AchievementUnlocked(address indexed player, string achievement)"
  ],
  
  NFT_CONTRACT: [
    // Achievement queries
    "function hasAchievement(address _player, string memory _achievement) external view returns (bool)",
    "function getPlayerAchievements(address _player) external view returns (string[])",
    "function getAchievementMetadata(string memory _achievement) external view returns (tuple(string name, string description, string imageURI, uint256 totalMinted, bool exists))",
    
    // ERC-721 standard
    "function balanceOf(address owner) external view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "function tokenURI(uint256 tokenId) external view returns (string)",
    
    // Events
    "event AchievementMinted(address indexed player, string achievement, uint256 tokenId)"
  ]
};

// Current network (will be set based on user's wallet)
let currentNetwork = 'TESTNET'; // Default to testnet

// Web3 provider and contracts
let web3Provider = null;
let gameContract = null;
let nftContract = null;
let userAccount = null;

// Initialize Web3
async function initWeb3() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider
      web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get user account
      const accounts = await web3Provider.listAccounts();
      userAccount = accounts[0];
      
      // Check and switch to Ape Chain if needed
      await ensureCorrectNetwork();
      
      // Initialize contracts
      initContracts();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      return false;
    }
  } else {
    console.error('MetaMask not detected');
    return false;
  }
}

// Initialize smart contracts
function initContracts() {
  if (!web3Provider) return;
  
  const signer = web3Provider.getSigner();
  const addresses = CONTRACT_ADDRESSES[currentNetwork];
  
  if (addresses.GAME_CONTRACT) {
    gameContract = new ethers.Contract(
      addresses.GAME_CONTRACT,
      CONTRACT_ABIS.GAME_CONTRACT,
      signer
    );
  }
  
  if (addresses.NFT_CONTRACT) {
    nftContract = new ethers.Contract(
      addresses.NFT_CONTRACT,
      CONTRACT_ABIS.NFT_CONTRACT,
      signer
    );
  }
}

// Ensure user is on the correct network
async function ensureCorrectNetwork() {
  const network = currentNetwork === 'MAINNET' ? NETWORKS.APECHAIN_MAINNET : NETWORKS.APECHAIN_TESTNET;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [network],
        });
      } catch (addError) {
        console.error('Failed to add network:', addError);
        throw addError;
      }
    } else {
      console.error('Failed to switch network:', switchError);
      throw switchError;
    }
  }
}

// Handle account changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    userAccount = null;
    gameContract = null;
    nftContract = null;
    updateUI();
  } else {
    userAccount = accounts[0];
    initContracts();
    updateUI();
  }
}

// Handle chain changes
function handleChainChanged(chainId) {
  // Reload the page to reset the dApp state
  window.location.reload();
}

// Update UI based on connection status
function updateUI() {
  const connectButton = document.getElementById('connect-wallet-btn');
  const walletInfo = document.getElementById('wallet-info');
  const accountDisplay = document.getElementById('account-display');
  
  if (userAccount) {
    if (connectButton) connectButton.style.display = 'none';
    if (walletInfo) walletInfo.style.display = 'block';
    if (accountDisplay) {
      accountDisplay.textContent = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
    }
  } else {
    if (connectButton) connectButton.style.display = 'block';
    if (walletInfo) walletInfo.style.display = 'none';
  }
}

// Export for use in other files
window.Web3Config = {
  NETWORKS,
  CONTRACT_ADDRESSES,
  CONTRACT_ABIS,
  initWeb3,
  ensureCorrectNetwork,
  getCurrentAccount: () => userAccount,
  getGameContract: () => gameContract,
  getNFTContract: () => nftContract,
  getProvider: () => web3Provider,
  updateUI
};
