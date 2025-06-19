# Web3 Whac-A-Mole Smart Contract Deployment Guide

## Prerequisites

1. **Node.js and npm** installed
2. **Private key** of an account with APE tokens for gas fees
3. **APE tokens** on Ape Chain testnet (Curtis) for deployment

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   ```
   PRIVATE_KEY=your_private_key_without_0x_prefix
   ETHERSCAN_API_KEY=your_api_key_if_available
   REPORT_GAS=true
   ```

## Network Configuration

The project is configured for Ape Chain networks:

### Testnet (Curtis)
- **Network Name:** Curtis
- **RPC URL:** https://curtis.rpc.caldera.xyz/http
- **Chain ID:** 33111
- **Currency Symbol:** APE
- **Block Explorer:** https://curtis.explorer.caldera.xyz/

### Mainnet
- **Network Name:** ApeChain
- **RPC URL:** https://apechain.calderachain.xyz/http
- **Chain ID:** 33139
- **Currency Symbol:** APE
- **Block Explorer:** https://apechain.calderaexplorer.xyz/

## Getting Testnet APE Tokens

1. Visit the [Ape Chain testnet faucet](https://curtis.hub.caldera.xyz/)
2. Connect your wallet
3. Request testnet APE tokens

## Deployment

### Deploy to Testnet

```bash
npm run deploy:testnet
```

### Deploy to Mainnet

```bash
npm run deploy:mainnet
```

## Contract Verification

After deployment, verify your contracts on the block explorer:

### Testnet Verification
```bash
npx hardhat verify --network apechain-testnet <GAME_CONTRACT_ADDRESS> "<DEPLOYER_ADDRESS>"
npx hardhat verify --network apechain-testnet <NFT_CONTRACT_ADDRESS> "<DEPLOYER_ADDRESS>" "<BASE_URI>"
```

### Mainnet Verification
```bash
npx hardhat verify --network apechain-mainnet <GAME_CONTRACT_ADDRESS> "<DEPLOYER_ADDRESS>"
npx hardhat verify --network apechain-mainnet <NFT_CONTRACT_ADDRESS> "<DEPLOYER_ADDRESS>" "<BASE_URI>"
```

## Contract Addresses

After deployment, save your contract addresses:

### Testnet Deployment
- WhacAMoleGame: `<DEPLOYED_ADDRESS>`
- WhacAMoleNFT: `<DEPLOYED_ADDRESS>`

### Mainnet Deployment
- WhacAMoleGame: `<DEPLOYED_ADDRESS>`
- WhacAMoleNFT: `<DEPLOYED_ADDRESS>`

## Testing

Run the test suite:

```bash
npm test
```

## Contract Features

### WhacAMoleGame Contract
- Player registration and management
- Game session tracking
- On-chain leaderboard
- Achievement system integration
- Pausable functionality for emergencies

### WhacAMoleNFT Contract
- ERC-721 NFT achievements
- Metadata generation
- Achievement verification
- Player achievement tracking

## Security Considerations

1. **Access Control:** Only the game contract can mint NFTs
2. **Reentrancy Protection:** All state-changing functions are protected
3. **Pausable:** Game can be paused in emergencies
4. **Input Validation:** All user inputs are validated

## Gas Optimization

- Contracts use Solidity 0.8.28 with IR optimizer enabled
- Efficient data structures for leaderboard management
- Minimal external calls to reduce gas costs

## Troubleshooting

### Common Issues

1. **"Insufficient funds" error:**
   - Ensure your account has enough APE tokens for gas fees

2. **"Network not found" error:**
   - Check your network configuration in hardhat.config.ts

3. **"Contract verification failed":**
   - Ensure you're using the correct constructor parameters
   - Check that the contract is fully deployed before verification

### Support

For issues or questions:
1. Check the [Ape Chain documentation](https://docs.apechain.com/)
2. Visit the [Ape Chain Discord](https://discord.gg/apechain)
3. Review the contract code and tests for implementation details
