#!/usr/bin/env node

/**
 * Script to update frontend configuration with deployed contract addresses
 * Run this after deploying contracts to update the Web3 configuration
 */

const fs = require('fs');
const path = require('path');

function updateFrontendConfig(network = 'testnet') {
  try {
    // Read deployment data
    const deploymentFile = path.join(__dirname, 'Contract', 'deployments', `apechain-${network}.json`);
    
    if (!fs.existsSync(deploymentFile)) {
      console.error(`❌ Deployment file not found: ${deploymentFile}`);
      console.log('Please deploy contracts first using: npm run deploy:testnet');
      return false;
    }
    
    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const contracts = deploymentData.contracts;
    
    console.log(`📋 Updating frontend config for ${network}...`);
    console.log(`Game Contract: ${contracts.WhacAMoleGame}`);
    console.log(`NFT Contract: ${contracts.WhacAMoleNFT}`);
    
    // Read current web3Config.ts
    const configFile = path.join(__dirname, 'react-frontend', 'src', 'config', 'web3Config.ts');
    let configContent = fs.readFileSync(configFile, 'utf8');
    
    // Update contract addresses for the specified network
    const networkKey = network.toUpperCase();
    
    if (network === 'testnet') {
      // Update TESTNET addresses
      const gameAddressPattern = /TESTNET:\s*{\s*GAME_CONTRACT:\s*['"]([^'"]*)['"]/;
      const nftAddressPattern = /TESTNET:\s*{[^}]*NFT_CONTRACT:\s*['"]([^'"]*)['"]/;
      
      configContent = configContent.replace(gameAddressPattern, `TESTNET: {\n    GAME_CONTRACT: '${contracts.WhacAMoleGame}'`);
      configContent = configContent.replace(nftAddressPattern, (match) => {
        return match.replace(/NFT_CONTRACT:\s*['"][^'"]*['"]/, `NFT_CONTRACT: '${contracts.WhacAMoleNFT}'`);
      });
    } else {
      // Update MAINNET addresses
      const gameAddressPattern = /MAINNET:\s*{\s*GAME_CONTRACT:\s*['"]([^'"]*)['"]/;
      const nftAddressPattern = /MAINNET:\s*{[^}]*NFT_CONTRACT:\s*['"]([^'"]*)['"]/;
      
      configContent = configContent.replace(gameAddressPattern, `MAINNET: {\n    GAME_CONTRACT: '${contracts.WhacAMoleGame}'`);
      configContent = configContent.replace(nftAddressPattern, (match) => {
        return match.replace(/NFT_CONTRACT:\s*['"][^'"]*['"]/, `NFT_CONTRACT: '${contracts.WhacAMoleNFT}'`);
      });
    }
    
    // Write updated config
    fs.writeFileSync(configFile, configContent);
    
    // Also create a deployment info file for the frontend
    const frontendDeploymentInfo = {
      network: network,
      chainId: network === 'testnet' ? 33111 : 33139,
      contracts: contracts,
      timestamp: deploymentData.timestamp || new Date().toISOString(),
      blockExplorer: network === 'testnet' ? 
        'https://curtis.explorer.caldera.xyz/' : 
        'https://apechain.calderaexplorer.xyz/'
    };
    
    const frontendInfoFile = path.join(__dirname, 'react-frontend', 'public', 'deployment-info.json');
    fs.writeFileSync(frontendInfoFile, JSON.stringify(frontendDeploymentInfo, null, 2));
    
    console.log('✅ Frontend configuration updated successfully!');
    console.log(`📄 Deployment info saved to: ${frontendInfoFile}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to update frontend config:', error);
    return false;
  }
}

// Command line usage
if (require.main === module) {
  const network = process.argv[2] || 'testnet';
  
  if (!['testnet', 'mainnet'].includes(network)) {
    console.error('❌ Invalid network. Use "testnet" or "mainnet"');
    process.exit(1);
  }
  
  const success = updateFrontendConfig(network);
  process.exit(success ? 0 : 1);
}

module.exports = { updateFrontendConfig };
