const { ethers } = require("hardhat");
const { saveDeployment } = require("./save-deployment");

async function main() {
  console.log("Starting deployment to Ape Chain...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "APE");
  
  if (balance < ethers.parseEther("0.01")) {
    console.warn("Warning: Low balance. Make sure you have enough APE for deployment.");
  }
  
  try {
    // Deploy NFT contract first
    console.log("\n1. Deploying WhacAMoleNFT contract...");
    const WhacAMoleNFT = await ethers.getContractFactory("WhacAMoleNFT");
    const baseURI = "https://api.whacamole.game/metadata/"; // Replace with your actual metadata URI
    
    const nftContract = await WhacAMoleNFT.deploy(
      deployer.address, // initial owner
      baseURI
    );
    
    await nftContract.waitForDeployment();
    const nftAddress = await nftContract.getAddress();
    console.log("WhacAMoleNFT deployed to:", nftAddress);
    
    // Deploy main game contract
    console.log("\n2. Deploying WhacAMoleGame contract...");
    const WhacAMoleGame = await ethers.getContractFactory("WhacAMoleGame");
    
    const gameContract = await WhacAMoleGame.deploy(
      deployer.address // initial owner
    );
    
    await gameContract.waitForDeployment();
    const gameAddress = await gameContract.getAddress();
    console.log("WhacAMoleGame deployed to:", gameAddress);
    
    // Set up contract connections
    console.log("\n3. Setting up contract connections...");
    
    // Set NFT contract address in game contract
    console.log("Setting NFT contract address in game contract...");
    await gameContract.setNFTContract(nftAddress);
    
    // Set game contract address in NFT contract
    console.log("Setting game contract address in NFT contract...");
    await nftContract.setGameContract(gameAddress);
    
    console.log("\n✅ Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("==========================================");
    console.log("WhacAMoleGame:", gameAddress);
    console.log("WhacAMoleNFT: ", nftAddress);
    console.log("==========================================");
    
    // Save deployment info
    const deploymentInfo = {
      network: await ethers.provider.getNetwork(),
      deployer: deployer.address,
      contracts: {
        WhacAMoleGame: gameAddress,
        WhacAMoleNFT: nftAddress
      },
      deploymentTime: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber()
    };
    
    console.log("\n📄 Deployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Save deployment data
    const network = await ethers.provider.getNetwork();
    const networkName = network.chainId === 33111n ? "apechain-testnet" :
                       network.chainId === 33139n ? "apechain-mainnet" :
                       network.name;

    saveDeployment(networkName, {
      WhacAMoleGame: gameAddress,
      WhacAMoleNFT: nftAddress
    });

    // Verify contracts (if on testnet/mainnet)
    if (networkName !== "hardhat" && networkName !== "localhost") {
      console.log("\n🔍 Contract verification info:");
      console.log("To verify WhacAMoleGame contract, run:");
      console.log(`npx hardhat verify --network ${networkName} ${gameAddress} "${deployer.address}"`);
      console.log("\nTo verify WhacAMoleNFT contract, run:");
      console.log(`npx hardhat verify --network ${networkName} ${nftAddress} "${deployer.address}" "${baseURI}"`);
    }

    return deploymentInfo;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
