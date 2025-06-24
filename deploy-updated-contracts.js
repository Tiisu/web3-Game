// Deploy updated contracts with proper error handling

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, cwd = '.') {
  try {
    console.log(`Running: ${command}`);
    const result = execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

async function deployContracts() {
  console.log('🚀 Starting contract deployment process...\n');
  
  // Step 1: Check environment
  console.log('1️⃣ Checking environment...');
  
  const envPath = path.join(__dirname, 'Contract', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found in Contract directory');
    console.log('Please create Contract/.env with your PRIVATE_KEY');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('PRIVATE_KEY=') || envContent.includes('PRIVATE_KEY=your_private_key_here')) {
    console.error('❌ PRIVATE_KEY not properly set in .env file');
    return false;
  }
  
  console.log('✅ Environment configuration OK');
  
  // Step 2: Compile contracts
  console.log('\n2️⃣ Compiling contracts...');
  
  const contractDir = path.join(__dirname, 'Contract');
  if (!runCommand('npx hardhat compile', contractDir)) {
    console.error('❌ Contract compilation failed');
    return false;
  }
  
  console.log('✅ Contracts compiled successfully');
  
  // Step 3: Deploy contracts
  console.log('\n3️⃣ Deploying contracts to ApeChain testnet...');
  
  if (!runCommand('npx hardhat run scripts/deploy.js --network apechain-testnet', contractDir)) {
    console.error('❌ Contract deployment failed');
    return false;
  }
  
  console.log('✅ Contracts deployed successfully');
  
  // Step 4: Update frontend configuration
  console.log('\n4️⃣ Updating frontend configuration...');
  
  if (!runCommand('node update-frontend-config.js testnet')) {
    console.error('❌ Frontend configuration update failed');
    return false;
  }
  
  console.log('✅ Frontend configuration updated');
  
  // Step 5: Update frontend ABIs
  console.log('\n5️⃣ Updating frontend ABIs...');
  
  if (fs.existsSync('update-frontend-abis.js')) {
    if (!runCommand('node update-frontend-abis.js')) {
      console.warn('⚠️  ABI update failed, but continuing...');
    } else {
      console.log('✅ Frontend ABIs updated');
    }
  } else {
    console.log('⚠️  ABI update script not found, skipping...');
  }
  
  // Step 6: Display deployment info
  console.log('\n6️⃣ Deployment Summary');
  console.log('='.repeat(50));
  
  try {
    const deploymentFile = path.join(__dirname, 'Contract', 'deployments', 'apechain-testnet-addresses.json');
    if (fs.existsSync(deploymentFile)) {
      const addresses = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
      console.log('📋 Contract Addresses:');
      console.log(`   Game Contract: ${addresses.WhacAMoleGame}`);
      console.log(`   NFT Contract:  ${addresses.WhacAMoleNFT}`);
      console.log('\n🔗 Block Explorer:');
      console.log(`   Game: https://curtis.explorer.caldera.xyz/address/${addresses.WhacAMoleGame}`);
      console.log(`   NFT:  https://curtis.explorer.caldera.xyz/address/${addresses.WhacAMoleNFT}`);
    }
  } catch (error) {
    console.warn('⚠️  Could not read deployment addresses');
  }
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Test the frontend connection');
  console.log('   2. Register a test player');
  console.log('   3. Play a test game');
  console.log('   4. Verify achievements work');
  
  return true;
}

// Run deployment if called directly
if (require.main === module) {
  deployContracts()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Deployment process failed:', error);
      process.exit(1);
    });
}

module.exports = deployContracts;