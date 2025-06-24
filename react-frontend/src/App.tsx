import React from 'react';
import { Web3Provider, useWeb3 } from './contexts/Web3Context';
import { GameProvider } from './contexts/GameContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import GameContainer from './components/GameContainer';
import AccessControl from './components/AccessControl';
import TrialGameOverlay from './components/TrialGameOverlay';
import './App.css';

// Main App Router Component
const AppRouter: React.FC = () => {
  const {
    currentView,
    startTrialGame,
    hasUsedTrial,
    navigateToGame
  } = useAppContext();

  const { connect } = useWeb3();

  const handleStartTrial = () => {
    startTrialGame();
  };

  const handleConnectWallet = async () => {
    try {
      const success = await connect();
      if (success) {
        console.log('✅ Wallet connected successfully');
      } else {
        console.warn('❌ Wallet connection failed');
      }
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
    }
  };

  if (currentView === 'landing') {
    return (
      <LandingPage
        onStartTrial={handleStartTrial}
        onConnectWallet={handleConnectWallet}
        onNavigateToGame={navigateToGame}
        trialUsed={hasUsedTrial}
      />
    );
  }

  if (currentView === 'game') {
    return (
      <AccessControl>
        <GameContainer />
        <TrialGameOverlay />
      </AccessControl>
    );
  }

  return null;
};

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <Web3Provider>
          <GameProvider>
            <NotificationProvider>
              <AppProvider>
                <AppRouter />
              </AppProvider>
            </NotificationProvider>
          </GameProvider>
        </Web3Provider>
      </ThemeProvider>
    </div>
  );
}

export default App;
