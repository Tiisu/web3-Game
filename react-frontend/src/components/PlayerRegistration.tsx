// Player registration modal component

import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/PlayerRegistration.css';

interface PlayerRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayerRegistration: React.FC<PlayerRegistrationProps> = ({
  isOpen,
  onClose
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
      
      // Close modal after successful registration
      setTimeout(() => {
        onClose();
      }, 2000);
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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <h2>Welcome to Web3 Whac-A-Mole!</h2>
          <p>
            Register your player profile to start earning achievements and 
            competing on the leaderboard.
          </p>
          
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="input-group">
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                maxLength={32}
                disabled={isLoading}
                className="username-input"
                autoFocus
              />
              <div className="character-count">
                {username.length}/32
              </div>
            </div>
            
            <button 
              type="submit"
              className={`register-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Registering...
                </>
              ) : (
                'Register Player'
              )}
            </button>
          </form>

          {status && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <div className="registration-info">
            <h3>What you'll get:</h3>
            <ul>
              <li>🏆 NFT achievements for milestones</li>
              <li>📊 Permanent game statistics</li>
              <li>🌍 Global leaderboard ranking</li>
              <li>⛓️ Blockchain-verified scores</li>
            </ul>
          </div>

          <div className="gas-info">
            <small>
              ⛽ Registration requires a small gas fee (~$0.01-0.05 APE)
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerRegistration;
