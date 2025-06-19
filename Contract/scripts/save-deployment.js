const fs = require('fs');
const path = require('path');

/**
 * Save deployment addresses to a JSON file for frontend integration
 */
function saveDeployment(networkName, addresses) {
  const deploymentDir = path.join(__dirname, '..', 'deployments');
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentDir, `${networkName}.json`);
  
  const deploymentData = {
    network: networkName,
    timestamp: new Date().toISOString(),
    contracts: addresses,
    abi: {
      WhacAMoleGame: require('../artifacts/contracts/WhacAMoleGame.sol/WhacAMoleGame.json').abi,
      WhacAMoleNFT: require('../artifacts/contracts/WhacAMoleNFT.sol/WhacAMoleNFT.json').abi
    }
  };
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  console.log(`✅ Deployment data saved to: ${deploymentFile}`);
  
  // Also create a simple addresses file for quick reference
  const addressesFile = path.join(deploymentDir, `${networkName}-addresses.json`);
  fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
  console.log(`📋 Contract addresses saved to: ${addressesFile}`);
}

module.exports = { saveDeployment };
