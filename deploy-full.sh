#!/bin/bash

# Full deployment script for Web3 Whac-A-Mole
# This script deploys contracts and updates frontend configuration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default network
NETWORK=${1:-testnet}

echo -e "${BLUE}🦍 Web3 Whac-A-Mole Deployment Script${NC}"
echo -e "${BLUE}======================================${NC}"

# Validate network parameter
if [[ "$NETWORK" != "testnet" && "$NETWORK" != "mainnet" ]]; then
    echo -e "${RED}❌ Invalid network: $NETWORK${NC}"
    echo -e "${YELLOW}Usage: ./deploy-full.sh [testnet|mainnet]${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Deploying to: $NETWORK${NC}"

# Check if .env file exists
if [ ! -f "Contract/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp Contract/.env.example Contract/.env
    echo -e "${RED}❌ Please edit Contract/.env with your private key and run again${NC}"
    exit 1
fi

# Check if private key is set
if ! grep -q "PRIVATE_KEY=your_private_key_here" Contract/.env; then
    echo -e "${GREEN}✅ Private key configured${NC}"
else
    echo -e "${RED}❌ Please set your PRIVATE_KEY in Contract/.env${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Installing dependencies...${NC}"
cd Contract
npm install --silent

echo -e "${BLUE}🧪 Running tests...${NC}"
npm test

echo -e "${BLUE}🏗️  Compiling contracts...${NC}"
npm run compile

echo -e "${BLUE}🚀 Deploying contracts to $NETWORK...${NC}"
if [ "$NETWORK" = "testnet" ]; then
    npm run deploy:testnet
else
    npm run deploy:mainnet
fi

echo -e "${BLUE}📝 Updating frontend configuration...${NC}"
cd ..
node update-frontend-config.js $NETWORK

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}======================================${NC}"

# Display deployment info
if [ -f "Contract/deployments/apechain-$NETWORK.json" ]; then
    echo -e "${BLUE}📋 Deployment Summary:${NC}"
    cat Contract/deployments/apechain-$NETWORK.json | jq -r '
        "Network: " + .network + 
        "\nGame Contract: " + .contracts.WhacAMoleGame + 
        "\nNFT Contract: " + .contracts.WhacAMoleNFT + 
        "\nDeployment Time: " + .timestamp'
    
    echo -e "\n${BLUE}🔍 Block Explorer Links:${NC}"
    GAME_CONTRACT=$(cat Contract/deployments/apechain-$NETWORK.json | jq -r '.contracts.WhacAMoleGame')
    NFT_CONTRACT=$(cat Contract/deployments/apechain-$NETWORK.json | jq -r '.contracts.WhacAMoleNFT')
    
    if [ "$NETWORK" = "testnet" ]; then
        EXPLORER="https://curtis.explorer.caldera.xyz"
    else
        EXPLORER="https://apechain.calderaexplorer.xyz"
    fi
    
    echo -e "Game Contract: ${EXPLORER}/address/${GAME_CONTRACT}"
    echo -e "NFT Contract: ${EXPLORER}/address/${NFT_CONTRACT}"
fi

echo -e "\n${BLUE}🎮 Next Steps:${NC}"
echo -e "1. Serve the frontend: ${YELLOW}cd frontend && python -m http.server 8080${NC}"
echo -e "2. Open browser: ${YELLOW}http://localhost:8080${NC}"
echo -e "3. Connect your wallet and start playing!"

if [ "$NETWORK" = "testnet" ]; then
    echo -e "\n${YELLOW}💰 Need testnet APE tokens?${NC}"
    echo -e "Visit: https://curtis.hub.caldera.xyz/"
fi

echo -e "\n${GREEN}🦍 Happy gaming on ApeChain! 🎮${NC}"
