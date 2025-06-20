// Trial Game Overlay Component - Shows trial-specific UI elements

import React, { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import '../styles/TrialGameOverlay.css';

const TrialGameOverlay: React.FC = () => {
  const { userAccessLevel, endCurrentGame } = useAppContext();
  const { connect } = useWeb3();
  const { gameState, forceCleanupGame } = useGameContext();
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMolesHit, setFinalMolesHit] = useState(0);

  // Handle trial end cleanup
  const handleTrialEnd = useCallback(async () => {
    try {
      // Force cleanup the game state first
      await forceCleanupGame();
      // Then end the trial
      await endCurrentGame();
    } catch (error) {
      console.error('Failed to end trial properly:', error);
      // Fallback to just ending the trial
      await endCurrentGame();
    }
  }, [forceCleanupGame, endCurrentGame]);

  // Detect when trial game ends
  useEffect(() => {
    if (userAccessLevel === 'trial_active' && gameState.gameOver && gameState.score > 0) {
      // Game just ended, capture final stats and show modal
      setFinalScore(gameState.score);
      setFinalMolesHit(gameState.molesHit);
      setShowGameOverModal(true);

      // Don't auto-dismiss the modal - let user control when to proceed
      // The modal will stay open until user clicks a button
    }
  }, [gameState.gameOver, gameState.score, userAccessLevel, gameState.molesHit]);

  // Only show overlay for trial users
  if (userAccessLevel !== 'trial_active') {
    return null;
  }

  const handleConnectWallet = async () => {
    try {
      const success = await connect();
      if (success) {
        // If wallet connection is successful, clean up and end trial
        await handleTrialEnd();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleEndTrial = async () => {
    await handleTrialEnd();
  };

  return (
    <div className="trial-overlay">
      {/* Trial Status Banner */}
      <div className="trial-banner">
        <div className="trial-banner-content">
          <span className="trial-icon">🎮</span>
          <div className="trial-info">
            <span className="trial-label">Free Trial Mode</span>
            <span className="trial-description">
              Connect your wallet after this game to unlock full features!
            </span>
          </div>
          <button 
            className="trial-connect-btn"
            onClick={handleConnectWallet}
          >
            🦍 Connect Wallet
          </button>
        </div>
      </div>

      {/* Trial Game Over Modal */}
      <div className={`trial-game-over-modal ${showGameOverModal ? 'show' : ''}`} id="trial-game-over">
        <div className="trial-modal-content">
          <div className="trial-modal-header">
            <h2 className="trial-modal-title">🎯 Trial Complete!</h2>
            <p className="trial-modal-subtitle">
              Great job! You've completed your free trial game.
            </p>
            <p className="trial-modal-subtitle" style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#4CAF50' }}>
              Choose your next step below to continue your Web3 gaming journey!
            </p>
          </div>

          <div className="trial-modal-body">
            <div className="trial-benefits">
              <h3>Connect your wallet to unlock:</h3>
              <ul className="benefits-list">
                <li>
                  <span className="benefit-icon">🏆</span>
                  <span>Global leaderboard competition</span>
                </li>
                <li>
                  <span className="benefit-icon">🎯</span>
                  <span>NFT achievement collection</span>
                </li>
                <li>
                  <span className="benefit-icon">💾</span>
                  <span>Persistent score tracking</span>
                </li>
                <li>
                  <span className="benefit-icon">🎮</span>
                  <span>Unlimited gameplay</span>
                </li>
                <li>
                  <span className="benefit-icon">🦍</span>
                  <span>ApeChain integration</span>
                </li>
              </ul>
            </div>

            <div className="trial-stats">
              <div className="stat-item">
                <span className="stat-label">Your Score</span>
                <span className="stat-value" id="trial-final-score">{finalScore}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Moles Hit</span>
                <span className="stat-value" id="trial-moles-hit">{finalMolesHit}</span>
              </div>
            </div>
          </div>

          <div className="trial-modal-actions">
            <button 
              className="trial-connect-wallet-btn"
              onClick={handleConnectWallet}
            >
              🦍 Connect Wallet & Continue
            </button>
            <button 
              className="trial-back-btn"
              onClick={handleEndTrial}
            >
              Back to Home
            </button>
          </div>

          <div className="trial-modal-footer">
            <p className="trial-footer-text">
              Join thousands of players competing on ApeChain!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialGameOverlay;
