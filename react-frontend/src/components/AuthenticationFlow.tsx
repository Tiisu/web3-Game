// Enhanced Authentication Flow Component

import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAppContext } from '../contexts/AppContext';
import PlayerRegistration from './PlayerRegistration';
import '../styles/AuthenticationFlow.css';

interface AuthenticationFlowProps {
  onComplete?: () => void;
  showCloseButton?: boolean;
}

const AuthenticationFlow: React.FC<AuthenticationFlowProps> = ({ 
  onComplete,
  showCloseButton = false 
}) => {
  const { web3State, connect, isLoading } = useWeb3();
  const { navigateToGame } = useAppContext();
  const [currentStep, setCurrentStep] = useState<'connect' | 'register' | 'complete'>('connect');

  // Determine current step based on Web3 state
  React.useEffect(() => {
    if (!web3State.isConnected) {
      setCurrentStep('connect');
    } else if (web3State.isConnected && !web3State.playerData?.isRegistered) {
      setCurrentStep('register');
    } else if (web3State.isConnected && web3State.playerData?.isRegistered) {
      setCurrentStep('complete');
    }
  }, [web3State.isConnected, web3State.playerData?.isRegistered]);

  const handleRegistrationComplete = () => {
    setCurrentStep('complete');
    onComplete?.();
  };

  const handleStartPlaying = () => {
    navigateToGame();
    onComplete?.();
  };

  const renderStepIndicator = () => (
    <div className="auth-step-indicator">
      <div className={`step ${currentStep === 'connect' ? 'active' : web3State.isConnected ? 'completed' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-label">Connect Wallet</div>
      </div>
      <div className="step-connector"></div>
      <div className={`step ${currentStep === 'register' ? 'active' : web3State.playerData?.isRegistered ? 'completed' : ''}`}>
        <div className="step-number">2</div>
        <div className="step-label">Register Profile</div>
      </div>
      <div className="step-connector"></div>
      <div className={`step ${currentStep === 'complete' ? 'active' : ''}`}>
        <div className="step-number">3</div>
        <div className="step-label">Start Playing</div>
      </div>
    </div>
  );

  const renderConnectStep = () => (
    <div className="auth-step-content">
      <div className="auth-step-header">
        <h2 className="auth-step-title">Connect Your Wallet</h2>
        <p className="auth-step-description">
          Connect your wallet to unlock Web3 features and start competing on ApeChain
        </p>
      </div>

      <div className="auth-benefits">
        <div className="benefit-item">
          <span className="benefit-icon">🏆</span>
          <span className="benefit-text">Compete on global leaderboard</span>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🎯</span>
          <span className="benefit-text">Earn NFT achievements</span>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">💾</span>
          <span className="benefit-text">Save your progress on-chain</span>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🦍</span>
          <span className="benefit-text">Built on ApeChain</span>
        </div>
      </div>

      <div className="auth-action">
        <button 
          className={`auth-primary-btn ${isLoading ? 'loading' : ''}`}
          onClick={connect}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Connecting...
            </>
          ) : (
            '🦍 Connect Wallet'
          )}
        </button>
      </div>

      <div className="auth-help">
        <p className="help-text">
          Don't have a wallet? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">Get MetaMask</a>
        </p>
      </div>
    </div>
  );

  const renderRegisterStep = () => (
    <div className="auth-step-content">
      <div className="auth-step-header">
        <h2 className="auth-step-title">Create Your Player Profile</h2>
        <p className="auth-step-description">
          Choose a username to represent you on the leaderboard and in the game
        </p>
      </div>

      <PlayerRegistration
        isOpen={true}
        onClose={() => {}}
        onComplete={handleRegistrationComplete}
        embedded={true}
      />
    </div>
  );

  const renderCompleteStep = () => (
    <div className="auth-step-content">
      <div className="auth-step-header">
        <div className="success-icon">🎉</div>
        <h2 className="auth-step-title">Welcome to Whac-A-Mole Web3!</h2>
        <p className="auth-step-description">
          Your wallet is connected and your profile is set up. You're ready to start playing!
        </p>
      </div>

      <div className="player-summary">
        <div className="summary-item">
          <span className="summary-label">Wallet:</span>
          <span className="summary-value">
            {web3State.account?.slice(0, 6)}...{web3State.account?.slice(-4)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Username:</span>
          <span className="summary-value">{web3State.playerData?.username}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Network:</span>
          <span className="summary-value">ApeChain Testnet</span>
        </div>
      </div>

      <div className="auth-action">
        <button 
          className="auth-primary-btn"
          onClick={handleStartPlaying}
        >
          🎮 Start Playing
        </button>
      </div>
    </div>
  );

  return (
    <div className="authentication-flow">
      <div className="auth-container">
        {showCloseButton && (
          <button className="auth-close-btn" onClick={onComplete}>
            ✕
          </button>
        )}

        {renderStepIndicator()}

        <div className="auth-content">
          {currentStep === 'connect' && renderConnectStep()}
          {currentStep === 'register' && renderRegisterStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationFlow;
