// Player registration modal component

import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/PlayerRegistration.css';

interface PlayerRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  embedded?: boolean;
}

const PlayerRegistration: React.FC<PlayerRegistrationProps> = ({
  isOpen,
  onClose,
  onComplete,
  embedded = false
}) => {
  const { registerPlayer, isLoading } = useWeb3();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setStatus({ message: 'Please enter a username', type: 'error' });
      return;
    }

    if (username.length > 32) {
      setStatus({ message: 'Username must be 32 characters or less', type: 'error' });
      return;
    }

    try {
      setStatus({ message: 'Registering player...', type: 'info' });
      await registerPlayer(username.trim());
      setStatus({ message: 'Player registered successfully!', type: 'success' });

      // Call onComplete callback if provided
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        // Close modal after successful registration
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      setStatus({ 
        message: `Registration failed: ${error.message}`, 
        type: 'error' 
      });
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (status?.type === 'error') {
      setStatus(null);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="modal-content">
      {/* Header Section */}
      <div className="registration-header">
        <div className="header-icon">
          <div className="icon-container">
            <span className="main-icon">🎮</span>
            <div className="icon-glow"></div>
          </div>
        </div>
        <h2 className="registration-title">
          Welcome to Web3 Whac-A-Mole!
        </h2>
        <p className="registration-subtitle">
          Create your player profile to unlock the full Web3 gaming experience
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-section">
          <label className="input-label">Choose Your Username</label>
          <div className="input-group">
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your gaming username"
                maxLength={32}
                disabled={isLoading}
                className="username-input"
                autoFocus
              />
              <div className="character-count">
                <span className={username.length > 25 ? 'warning' : ''}>
                  {username.length}/32
                </span>
              </div>
            </div>
            <div className="input-hint">
              This will be your identity on the leaderboard and in achievements
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`register-btn ${isLoading ? 'loading' : ''} ${!username.trim() ? 'disabled' : ''}`}
          disabled={isLoading || !username.trim()}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              <span>Creating Profile...</span>
            </>
          ) : (
            <>
              <span className="btn-icon">🚀</span>
              <span>Create Player Profile</span>
            </>
          )}
        </button>
      </form>

      {/* Status Message */}
      {status && (
        <div className={`status-message ${status.type}`}>
          <div className="status-icon">
            {status.type === 'success' && '✅'}
            {status.type === 'error' && '❌'}
            {status.type === 'info' && '⏳'}
          </div>
          <span className="status-text">{status.message}</span>
        </div>
      )}

      {/* Benefits Section */}
      <div className="benefits-section">
        <h3 className="benefits-title">
          <span className="title-icon">✨</span>
          Unlock Web3 Features
        </h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">🏆</div>
            <div className="benefit-content">
              <h4>NFT Achievements</h4>
              <p>Earn unique NFTs for game milestones</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">📊</div>
            <div className="benefit-content">
              <h4>Permanent Stats</h4>
              <p>Blockchain-verified game statistics</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🌍</div>
            <div className="benefit-content">
              <h4>Global Leaderboard</h4>
              <p>Compete with players worldwide</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">⛓️</div>
            <div className="benefit-content">
              <h4>Verified Scores</h4>
              <p>Tamper-proof score tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gas Fee Info */}
      <div className="gas-info">
        <div className="gas-icon">⛽</div>
        <div className="gas-content">
          <span className="gas-title">One-time Setup Fee</span>
          <span className="gas-amount">~$0.01-0.05 APE</span>
        </div>
        <div className="gas-description">
          Required for blockchain registration
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        {content}
      </div>
    </div>
  );
};

export default PlayerRegistration;
