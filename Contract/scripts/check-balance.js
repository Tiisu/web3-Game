const { ethers } = require("hardhat");

async function main() {
  console.log("Checking account balance on Ape Chain...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Account address:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "APE");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("\n⚠️  Warning: Low balance!");
    console.log("You need APE tokens to deploy contracts.");
    console.log("Get testnet APE from: https://curtis.hub.caldera.xyz/");
  } else {
    console.log("\n✅ Balance looks good for deployment!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
