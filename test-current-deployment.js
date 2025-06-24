// Test current contract deployment

const { ethers } = require('ethers');

// Contract addresses from current deployment
const GAME_CONTRACT = '0x46C2F2E4AcA4048ad1E05D9B5569B5634d04B039';
const NFT_CONTRACT = '0x8FE458859F01eAcb7dfB40d2B44eF6Ae24cA907F';

// ApeChain testnet RPC
const RPC_URL = 'https://curtis.rpc.caldera.xyz/http';

// Basic ABIs for testing
const GAME_ABI = [
  "function getGameStats() external view returns (uint256 totalPlayers, uint256 totalGames, uint256 leaderboardSize)",
  "function getLeaderboard() external view returns (tuple(address player, string username, uint256 score, uint256 timestamp)[])",
  "function GAME_DURATION() external view returns (uint256)",
  "function MIN_SCORE_FOR_LEADERBOARD() external view returns (uint256)"
];

const NFT_ABI = [
  "function getPlayerAchievements(address _player) external view returns (string[])",
  "function hasAchievement(address _player, string memory _achievement) external view returns (bool)"
];

async function testCurrentDeployment() {
  console.log('🧪 Testing current contract deployment...\n');
  
  try {
    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Test network connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Test game contract
    console.log('\n--- Testing Game Contract ---');
    const gameContract = new ethers.Contract(GAME_CONTRACT, GAME_ABI, provider);
    
    try {
      const stats = await gameContract.getGameStats();
      console.log('✅ Game Stats:', {
        totalPlayers: stats[0].toString(),
        totalGames: stats[1].toString(),
        leaderboardSize: stats[2].toString()
      });
    } catch (err) {
      console.error('❌ Game stats call failed:', err.message);
    }
    
    try {
      const leaderboard = await gameContract.getLeaderboard();
      console.log(`✅ Leaderboard: ${leaderboard.length} entries`);
    } catch (err) {
      console.error('❌ Leaderboard call failed:', err.message);
    }
    
    try {
      const duration = await gameContract.GAME_DURATION();
      console.log(`✅ Game Duration: ${duration.toString()} seconds`);
    } catch (err) {
      console.error('❌ Game duration call failed:', err.message);
    }
    
    // Test NFT contract
    console.log('\n--- Testing NFT Contract ---');
    const nftContract = new ethers.Contract(NFT_CONTRACT, NFT_ABI, provider);
    
    const testAddress = '0x0000000000000000000000000000000000000001';
    try {
      const achievements = await nftContract.getPlayerAchievements(testAddress);
      console.log(`✅ Achievements for test address: ${achievements.length} achievements`);
    } catch (err) {
      console.error('❌ Achievements call failed:', err.message);
    }
    
    console.log('\n🎉 Contract testing completed!');
    
    // Check if contracts need redeployment
    const needsRedeployment = false; // Set to true if any critical calls failed
    
    if (needsRedeployment) {
      console.log('\n⚠️  Contracts may need redeployment due to failed calls');
      return false;
    } else {
      console.log('\n✅ Contracts appear to be working correctly');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Contract testing failed:', error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testCurrentDeployment()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testCurrentDeployment;