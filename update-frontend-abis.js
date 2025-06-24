// Script to update frontend with latest contract ABIs

const fs = require('fs');
const path = require('path');

// Paths
const gameContractPath = 'Contract/artifacts/contracts/WhacAMoleGame.sol/WhacAMoleGame.json';
const nftContractPath = 'Contract/artifacts/contracts/WhacAMoleNFT.sol/WhacAMoleNFT.json';
const configPath = 'react-frontend/src/config/web3Config.ts';

function extractFunctionSignatures(abi) {
  return abi
    .filter(item => item.type === 'function' || item.type === 'event')
    .map(item => {
      if (item.type === 'function') {
        const inputs = item.inputs.map(input => `${input.type} ${input.name}`).join(', ');
        const outputs = item.outputs && item.outputs.length > 0 
          ? ` returns (${item.outputs.map(output => output.type).join(', ')})`
          : '';
        const mutability = item.stateMutability !== 'nonpayable' ? ` ${item.stateMutability}` : '';
        return `"function ${item.name}(${inputs})${mutability}${outputs}"`;
      } else if (item.type === 'event') {
        const inputs = item.inputs.map(input => {
          const indexed = input.indexed ? 'indexed ' : '';
          return `${indexed}${input.type} ${input.name}`;
        }).join(', ');
        return `"event ${item.name}(${inputs})"`;
      }
    })
    .filter(Boolean);
}

function updateConfig() {
  try {
    console.log('Reading contract artifacts...');
    
    // Read contract ABIs
    const gameContract = JSON.parse(fs.readFileSync(gameContractPath, 'utf8'));
    const nftContract = JSON.parse(fs.readFileSync(nftContractPath, 'utf8'));
    
    // Extract function signatures
    const gameABI = extractFunctionSignatures(gameContract.abi);
    const nftABI = extractFunctionSignatures(nftContract.abi);
    
    console.log(`Game contract functions: ${gameABI.length}`);
    console.log(`NFT contract functions: ${nftABI.length}`);
    
    // Read current config
    let config = fs.readFileSync(configPath, 'utf8');
    
    // Create new ABI section
    const newABISection = `// Contract ABIs (auto-generated from artifacts)
export const CONTRACT_ABIS = {
  GAME_CONTRACT: [
${gameABI.map(sig => `    ${sig}`).join(',\n')}
  ],
  
  NFT_CONTRACT: [
${nftABI.map(sig => `    ${sig}`).join(',\n')}
  ]
};`;
    
    // Replace the ABI section
    const abiStart = config.indexOf('// Contract ABIs');
    const abiEnd = config.indexOf('};', abiStart) + 2;
    
    if (abiStart !== -1 && abiEnd !== -1) {
      config = config.substring(0, abiStart) + newABISection + config.substring(abiEnd);
      
      // Write updated config
      fs.writeFileSync(configPath, config, 'utf8');
      console.log('✅ Frontend config updated with latest ABIs');
    } else {
      console.error('❌ Could not find ABI section in config file');
    }
    
  } catch (error) {
    console.error('❌ Failed to update config:', error.message);
  }
}

updateConfig();