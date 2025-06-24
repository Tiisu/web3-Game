# 🎮 Web3 Whac-A-Mole React Frontend

A modern React.js frontend for the Web3 Whac-A-Mole game built on ApeChain. This application provides a seamless gaming experience with blockchain integration for NFT achievements, global leaderboards, and player profiles.

## 🚀 Features

### Core Game Features
- **React-based Architecture**: Modern component-based structure with TypeScript
- **Custom Hooks**: Dedicated hooks for Web3, game logic, and notifications
- **Context Management**: Global state management for Web3, game, and notifications
- **Responsive Design**: Mobile-friendly interface that works on all devices

### Web3 Integration
- **Wallet Connection**: MetaMask and Web3 wallet integration
- **Smart Contract Interaction**: Direct interaction with ApeChain smart contracts
- **Real-time Updates**: Live blockchain data synchronization
- **Error Handling**: Comprehensive error management and user feedback

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ and npm
- MetaMask or compatible Web3 wallet
- Deployed smart contracts on ApeChain

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Update contract addresses** (after deploying contracts):
   ```bash
   node update-contracts.js testnet
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

## 🎯 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm run build:testnet`
Builds the app configured for ApeChain testnet

### `npm run build:production`
Builds the app configured for ApeChain mainnet

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
