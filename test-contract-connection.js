// Test script to verify contract connection
const { ethers } = require('ethers');

// Contract addresses from deployment
const GAME_CONTRACT_ADDRESS = '0x46C2F2E4AcA4048ad1E05D9B5569B5634d04B039';
const NFT_CONTRACT_ADDRESS = '0x8FE458859F01eAcb7dfB40d2B44eF6Ae24cA907F';

// ApeChain testnet RPC
const RPC_URL = 'https://curtis.rpc.caldera.xyz/http';

// Simplified ABIs for testing
const GAME_ABI = [
  "function getPlayer(address _player) external view returns (tuple(address playerAddress, string username, uint256 totalGamesPlayed, uint256 totalScore, uint256 highestScore, uint256 totalMolesHit, uint256 registrationTime, bool isRegistered))",
  "function getLeaderboard() external view returns (tuple(address player, string username, uint256 score, uint256 timestamp)[])",
  "function getGameStats() external view returns (uint256 totalPlayers, uint256 totalGames, uint256 leaderboardSize)"
];

const NFT_ABI = [
  "function getPlayerAchievements(address _player) external view returns (string[])",
  "function hasAchievement(address _player, string memory _achievement) external view returns (bool)"
];

async function testContractConnection() {
  try {
    console.log('Testing contract connection...');
    
    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Test network connection
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
    
    // Create contract instances
    const gameContract = new ethers.Contract(GAME_CONTRACT_ADDRESS, GAME_ABI, provider);
    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
    
    console.log('Contract instances created successfully');
    
    // Test basic contract calls
    console.log('\n--- Testing Game Contract ---');
    
    try {
      const gameStats = await gameContract.getGameStats();
      console.log('Game Stats:', {
        totalPlayers: gameStats[0].toString(),
        totalGames: gameStats[1].toString(),
        leaderboardSize: gameStats[2].toString()
      });
    } catch (err) {
      console.error('Error getting game stats:', err.message);
    }
    
    try {
      const leaderboard = await gameContract.getLeaderboard();
      console.log('Leaderboard entries:', leaderboard.length);
    } catch (err) {
      console.error('Error getting leaderboard:', err.message);
    }
    
    // Test with a dummy address
    const testAddress = '0x0000000000000000000000000000000000000001';
    try {
      const playerData = await gameContract.getPlayer(testAddress);
      console.log('Player data for test address:', {
        isRegistered: playerData.isRegistered,
        username: playerData.username
      });
    } catch (err) {
      console.log('Expected error for unregistered player:', err.message);
    }
    
    console.log('\n--- Testing NFT Contract ---');
    
    try {
      const achievements = await nftContract.getPlayerAchievements(testAddress);
      console.log('Achievements for test address:', achievements);
    } catch (err) {
      console.error('Error getting achievements:', err.message);
    }
    
    console.log('\n✅ Contract connection test completed');
    
  } catch (error) {
    console.error('❌ Contract connection test failed:', error);
  }
}

testContractConnection();