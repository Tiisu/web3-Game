# 🦍 Web3 Whac-A-Mole on ApeChain

A decentralized Whac-A-Mole game built on ApeChain that combines classic arcade gameplay with Web3 features including NFT achievements, on-chain leaderboards, and player profiles.

## 🎮 Features

### Core Game Features
- **Classic Whac-A-Mole Gameplay**: Hit moles, avoid plants, score points
- **Progressive Difficulty**: 5 levels with increasing speed and complexity
- **Level System**: Advance through levels with score multipliers
- **Audio & Visual Effects**: Immersive gaming experience with sounds and animations

### Web3 Features
- **🔗 Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **👤 Player Profiles**: On-chain player registration and statistics
- **🏆 NFT Achievements**: Mint unique NFT badges for milestones
- **📊 Global Leaderboard**: Compete with players worldwide on ApeChain
- **⛓️ Cross-Session Persistence**: Your progress is saved on the blockchain

### Achievements System
- **🎯 Beginner**: Score 1,000+ points (NFT)
- **🏆 Pro**: Score 5,000+ points (NFT)
- **👑 Master**: Score 10,000+ points (NFT)
- **🎮 Regular Player**: Play 10+ games (NFT)
- **⭐ Veteran**: Play 100+ games (NFT)

## 🚀 Quick Start

### For Players

1. **Visit the Game**: Open `frontend/index.html` in your browser
2. **Connect Wallet**: Click "Connect Wallet" and approve the connection
3. **Add ApeChain**: The game will prompt you to add ApeChain network to your wallet
4. **Register**: Create your player profile with a username
5. **Play & Earn**: Start playing to earn NFT achievements and climb the leaderboard!

### Network Details

#### ApeChain Testnet (Curtis)
- **Chain ID**: 33111
- **RPC URL**: https://curtis.rpc.caldera.xyz/http
- **Explorer**: https://curtis.explorer.caldera.xyz/
- **Faucet**: https://curtis.hub.caldera.xyz/

#### ApeChain Mainnet
- **Chain ID**: 33139
- **RPC URL**: https://apechain.calderachain.xyz/http
- **Explorer**: https://apechain.calderaexplorer.xyz/

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ and npm
- MetaMask or compatible Web3 wallet
- APE tokens for gas fees

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd web3-Game
   ```

2. **Install contract dependencies**:
   ```bash
   cd Contract
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your private key
   ```

### Smart Contract Development

1. **Compile contracts**:
   ```bash
   cd Contract
   npm run compile
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Deploy to testnet**:
   ```bash
   npm run deploy:testnet
   ```

4. **Update frontend configuration**:
   ```bash
   cd ..
   node update-frontend-config.js testnet
   ```

### Frontend Development

1. **Serve the frontend**:
   ```bash
   cd frontend
   # Use any static file server, e.g.:
   python -m http.server 8080
   # or
   npx serve .
   ```

2. **Open in browser**: Navigate to `http://localhost:8080`

## 📁 Project Structure

```
web3-Game/
├── Contract/                 # Smart contracts
│   ├── contracts/           # Solidity contracts
│   │   ├── WhacAMoleGame.sol    # Main game contract
│   │   └── WhacAMoleNFT.sol     # NFT achievements contract
│   ├── scripts/             # Deployment scripts
│   ├── test/                # Contract tests
│   └── deployments/         # Deployment artifacts
├── frontend/                # Frontend application
│   ├── index.html          # Main HTML file
│   ├── mole.js             # Game logic + Web3 integration
│   ├── mole.css            # Game styles
│   ├── web3-config.js      # Web3 configuration
│   ├── web3-integration.js # Web3 integration logic
│   ├── web3-styles.css     # Web3 UI styles
│   ├── images/             # Game assets
│   └── audio/              # Sound effects
└── update-frontend-config.js # Configuration update script
```

## 🔧 Smart Contracts

### WhacAMoleGame.sol
- Player registration and management
- Game session tracking
- Leaderboard management
- Achievement verification
- Statistics tracking

### WhacAMoleNFT.sol
- ERC-721 NFT implementation
- Achievement metadata
- Player achievement tracking
- Rarity system

## 🎯 Game Mechanics

### Scoring System
- **Mole Type 1**: 10 points (base)
- **Mole Type 2**: 20 points (base)
- **Level Multiplier**: Points × (1 + (level-1) × 0.2)
- **Penalty**: Hitting plants ends the game

### Level Progression
- **Level 1**: Base speed
- **Level 2**: 10% faster moles
- **Level 3**: 20% faster moles + plants
- **Level 4**: 30% faster + more challenging
- **Level 5**: Expert mode - maximum difficulty

## 🔐 Security Features

- **Access Control**: Only game contract can mint NFTs
- **Reentrancy Protection**: All state-changing functions protected
- **Input Validation**: Comprehensive validation of user inputs
- **Pausable**: Emergency pause functionality
- **Upgradeable**: Owner can update critical parameters

## 🌐 Deployment

### Testnet Deployment
```bash
cd Contract
npm run deploy:testnet
```

### Mainnet Deployment
```bash
cd Contract
npm run deploy:mainnet
```

### Contract Verification
```bash
npm run verify:testnet
# or
npm run verify:mainnet
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/Contract/DEPLOYMENT.md` for detailed deployment instructions
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Community**: Join the ApeChain Discord for community support

## 🎉 Acknowledgments

- Built on ApeChain for fast, low-cost transactions
- Powered by OpenZeppelin for secure smart contracts
- Uses Ethers.js for Web3 integration
- Inspired by classic arcade games

---

**Ready to play? Connect your wallet and start whacking moles on ApeChain! 🦍🎮**
