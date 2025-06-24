#!/bin/bash

# Deploy contracts to ApeChain testnet
echo "🚀 Starting contract deployment to ApeChain testnet..."

cd Contract

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with your PRIVATE_KEY"
    exit 1
fi

# Check if private key is set
if ! grep -q "PRIVATE_KEY=" .env || grep -q "PRIVATE_KEY=your_private_key_here" .env; then
    echo "❌ PRIVATE_KEY not set in .env file"
    exit 1
fi

echo "✅ Environment file found"

# Compile contracts
echo "📦 Compiling contracts..."
if command -v npx &> /dev/null; then
    npx hardhat compile
else
    echo "⚠️  npx not available, assuming contracts are already compiled"
fi

# Deploy to testnet
echo "🌐 Deploying to ApeChain testnet..."
if command -v npx &> /dev/null; then
    npx hardhat run scripts/deploy.js --network apechain-testnet
else
    echo "❌ Cannot deploy - npx not available"
    echo "Please run manually: npx hardhat run scripts/deploy.js --network apechain-testnet"
    exit 1
fi

echo "✅ Deployment completed!"

# Update frontend config
echo "🔄 Updating frontend configuration..."
cd ..
if [ -f "update-frontend-config.js" ]; then
    if command -v node &> /dev/null; then
        node update-frontend-config.js
    else
        echo "⚠️  Node.js not available, please update frontend config manually"
    fi
else
    echo "⚠️  update-frontend-config.js not found, please update frontend config manually"
fi

echo "🎉 All done! Check the console output for contract addresses."