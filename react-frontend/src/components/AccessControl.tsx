// Access Control Component - Manages user access levels and appropriate UI

import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useWeb3 } from '../contexts/Web3Context';
import AuthenticationFlow from './AuthenticationFlow';
import '../styles/AccessControl.css';

interface AccessControlProps {
  children: React.ReactNode;
}

const AccessControl: React.FC<AccessControlProps> = ({ children }) => {
  const { userAccessLevel, canPlayGame } = useAppContext();
  const { web3State } = useWeb3();
  const [showAuthFlow, setShowAuthFlow] = useState(false);

  const handleShowAuthFlow = () => {
    setShowAuthFlow(true);
  };

  const handleCloseAuthFlow = () => {
    setShowAuthFlow(false);
  };

  // Render access denied overlay for users who can't play
  const renderAccessDenied = () => {
    switch (userAccessLevel) {
      case 'trial_used':
        return (
          <div className="access-control-overlay">
            <div className="access-denied-content">
              <div className="access-denied-icon">🔒</div>
              <h2 className="access-denied-title">Trial Complete</h2>
              <p className="access-denied-description">
                You've completed your free trial! Connect your wallet to continue playing 
                and unlock all Web3 features.
              </p>
              <div className="access-denied-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">🏆</span>
                  <span>Compete on global leaderboard</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🎯</span>
                  <span>Earn NFT achievements</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💾</span>
                  <span>Save progress on blockchain</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🎮</span>
                  <span>Unlimited gameplay</span>
                </div>
              </div>
              <button 
                className="access-denied-action"
                onClick={handleShowAuthFlow}
              >
                🦍 Connect Wallet
              </button>
            </div>
          </div>
        );

      case 'connected_unregistered':
        return (
          <div className="access-control-overlay">
            <div className="access-denied-content">
              <div className="access-denied-icon">👤</div>
              <h2 className="access-denied-title">Registration Required</h2>
              <p className="access-denied-description">
                Your wallet is connected! Complete your player registration to start playing.
              </p>
              <div className="wallet-info">
                <div className="wallet-status">
                  <span className="wallet-icon">🔗</span>
                  <span className="wallet-address">
                    {web3State.account?.slice(0, 6)}...{web3State.account?.slice(-4)}
                  </span>
                  <span className="network-badge">ApeChain</span>
                </div>
              </div>
              <div className="registration-benefits">
                <h3>Complete registration to unlock:</h3>
                <ul>
                  <li>🏆 NFT achievements for milestones</li>
                  <li>📊 Permanent game statistics</li>
                  <li>🌍 Global leaderboard ranking</li>
                  <li>⛓️ Blockchain-verified scores</li>
                </ul>
              </div>
              <button 
                className="access-denied-action"
                onClick={handleShowAuthFlow}
              >
                Complete Registration
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="access-control-overlay">
            <div className="access-denied-content">
              <div className="access-denied-icon">⚠️</div>
              <h2 className="access-denied-title">Access Restricted</h2>
              <p className="access-denied-description">
                You don't have permission to access this feature.
              </p>
              <button 
                className="access-denied-action"
                onClick={handleShowAuthFlow}
              >
                Get Access
              </button>
            </div>
          </div>
        );
    }
  };

  // Show authentication flow if requested
  if (showAuthFlow) {
    return (
      <AuthenticationFlow 
        onComplete={handleCloseAuthFlow}
        showCloseButton={true}
      />
    );
  }

  // If user can play, render children (the game)
  if (canPlayGame) {
    return <>{children}</>;
  }

  // Otherwise, show access denied overlay
  return (
    <div className="access-control-container">
      {children}
      {renderAccessDenied()}
    </div>
  );
};

export default AccessControl;
