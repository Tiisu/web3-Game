// Enhanced Web3 Feedback Component
// Provides modern gaming-style feedback for Web3 transactions

import React, { useEffect, useState } from 'react';
import { useParticleEffects } from '../hooks/useParticleEffects';
import '../styles/EnhancedWeb3Feedback.css';

export interface TransactionFeedbackProps {
  type: 'connecting' | 'signing' | 'pending' | 'success' | 'error';
  message: string;
  txHash?: string;
  isVisible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const EnhancedTransactionFeedback: React.FC<TransactionFeedbackProps> = ({
  type,
  message,
  txHash,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const particleEffects = useParticleEffects();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible && type === 'success') {
      // Create success particle effect
      const feedback = document.querySelector('.enhanced-web3-feedback');
      if (feedback) {
        const rect = feedback.getBoundingClientRect();
        particleEffects.createWeb3Success(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
      }
    }
  }, [isVisible, type, particleEffects]);

  useEffect(() => {
    if (isVisible && autoClose && (type === 'success' || type === 'error')) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      // Progress bar animation
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (duration / 100));
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [isVisible, autoClose, type, duration, onClose]);

  useEffect(() => {
    if (isVisible) {
      setProgress(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'connecting': return '🔗';
      case 'signing': return '✍️';
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  const getStatusClass = () => {
    return `feedback-${type}`;
  };

  return (
    <div className={`enhanced-web3-feedback ${getStatusClass()} ${isVisible ? 'visible' : ''}`}>
      <div className="feedback-content">
        <div className="feedback-header">
          <div className="feedback-icon">
            <span className="icon-main">{getIcon()}</span>
            <div className="icon-glow"></div>
          </div>
          <div className="feedback-text">
            <h4 className="feedback-title">
              {type === 'connecting' && 'Connecting to Wallet'}
              {type === 'signing' && 'Please Sign Transaction'}
              {type === 'pending' && 'Transaction Pending'}
              {type === 'success' && 'Transaction Successful!'}
              {type === 'error' && 'Transaction Failed'}
            </h4>
            <p className="feedback-message">{message}</p>
          </div>
          {onClose && (
            <button className="feedback-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {txHash && (
          <div className="feedback-details">
            <div className="tx-hash">
              <span className="tx-label">Transaction Hash:</span>
              <a 
                href={`https://apechain.calderaexplorer.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </div>
          </div>
        )}

        {type === 'pending' && (
          <div className="feedback-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <span className="progress-text">Confirming on ApeChain...</span>
          </div>
        )}

        {autoClose && (type === 'success' || type === 'error') && (
          <div className="feedback-timer">
            <div className="timer-bar">
              <div 
                className="timer-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="feedback-background"></div>
    </div>
  );
};

export interface Web3StatusToastProps {
  status: 'connected' | 'disconnected' | 'error';
  message: string;
  isVisible: boolean;
  onClose?: () => void;
}

export const Web3StatusToast: React.FC<Web3StatusToastProps> = ({
  status,
  message,
  isVisible,
  onClose
}) => {
  const particleEffects = useParticleEffects();

  useEffect(() => {
    if (isVisible && status === 'connected') {
      // Create connection success effect
      const toast = document.querySelector('.web3-status-toast');
      if (toast) {
        const rect = toast.getBoundingClientRect();
        particleEffects.createWeb3Success(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
      }
    }
  }, [isVisible, status, particleEffects]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (status) {
      case 'connected': return '🔗';
      case 'disconnected': return '🔌';
      case 'error': return '⚠️';
      default: return '🔄';
    }
  };

  return (
    <div className={`web3-status-toast toast-${status} ${isVisible ? 'visible' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon">
          <span>{getIcon()}</span>
        </div>
        <div className="toast-message">
          <span className="toast-title">
            {status === 'connected' && 'Wallet Connected'}
            {status === 'disconnected' && 'Wallet Disconnected'}
            {status === 'error' && 'Connection Error'}
          </span>
          <span className="toast-text">{message}</span>
        </div>
        {onClose && (
          <button className="toast-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export interface GameTransactionFeedbackProps {
  type: 'registration' | 'gameStart' | 'gameComplete' | 'achievement';
  isVisible: boolean;
  gameData?: {
    score?: number;
    level?: number;
    achievement?: string;
  };
  onComplete?: () => void;
}

export const GameTransactionFeedback: React.FC<GameTransactionFeedbackProps> = ({
  type,
  isVisible,
  gameData,
  onComplete
}) => {
  const particleEffects = useParticleEffects();

  useEffect(() => {
    if (isVisible) {
      const feedback = document.querySelector('.game-transaction-feedback');
      if (feedback) {
        const rect = feedback.getBoundingClientRect();
        
        if (type === 'achievement') {
          particleEffects.createAchievementBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
          );
        } else if (type === 'gameComplete') {
          particleEffects.createWeb3Success(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
          );
        }
      }
    }
  }, [isVisible, type, particleEffects]);

  if (!isVisible) return null;

  const getContent = () => {
    switch (type) {
      case 'registration':
        return {
          icon: '📝',
          title: 'Registering Player',
          message: 'Creating your Web3 gaming profile...'
        };
      case 'gameStart':
        return {
          icon: '🎮',
          title: 'Starting Game Session',
          message: 'Initializing blockchain game session...'
        };
      case 'gameComplete':
        return {
          icon: '🏆',
          title: 'Game Complete!',
          message: `Score: ${gameData?.score || 0} | Level: ${gameData?.level || 1}`
        };
      case 'achievement':
        return {
          icon: '🎯',
          title: 'Achievement Unlocked!',
          message: gameData?.achievement || 'New achievement earned!'
        };
      default:
        return {
          icon: '🔄',
          title: 'Processing...',
          message: 'Please wait...'
        };
    }
  };

  const content = getContent();

  return (
    <div className={`game-transaction-feedback feedback-${type} ${isVisible ? 'visible' : ''}`}>
      <div className="game-feedback-content">
        <div className="game-feedback-icon">
          <span className="game-icon">{content.icon}</span>
          <div className="game-icon-glow"></div>
        </div>
        <div className="game-feedback-text">
          <h3 className="game-feedback-title">{content.title}</h3>
          <p className="game-feedback-message">{content.message}</p>
        </div>
      </div>
      
      {type === 'gameComplete' || type === 'achievement' ? (
        <button className="game-feedback-continue" onClick={onComplete}>
          Continue
        </button>
      ) : (
        <div className="game-feedback-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};
