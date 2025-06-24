// Enhanced Web3 Feedback Component System
// Provides cohesive visual feedback for blockchain interactions

import React from 'react';
import '../styles/Web3Feedback.css';

export interface TransactionStep {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface Web3TransactionProgressProps {
  isVisible: boolean;
  title: string;
  message: string;
  steps: TransactionStep[];
  status: 'pending' | 'success' | 'error';
  onClose?: () => void;
}

export const Web3TransactionProgress: React.FC<Web3TransactionProgressProps> = ({
  isVisible,
  title,
  message,
  steps,
  status,
  onClose
}) => {
  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return '';
    }
  };

  return (
    <div className="web3-confirmation-overlay">
      <div className={`web3-transaction-progress ${getStatusClass()}`}>
        <div className={`transaction-icon ${status}`}>
          {status === 'pending' ? (
            <div className="web3-loading-spinner" />
          ) : (
            getStatusIcon()
          )}
        </div>
        
        <h3 className="transaction-title">{title}</h3>
        <p className="transaction-message">{message}</p>
        
        {steps.length > 0 && (
          <div className="transaction-steps">
            {steps.map((step) => (
              <div key={step.id} className={`transaction-step ${step.status}`}>
                <div className={`step-icon ${step.status}`}>
                  {step.status === 'completed' ? '✓' : 
                   step.status === 'error' ? '✗' : 
                   step.status === 'active' ? '⏳' : step.icon}
                </div>
                <span className={`step-label ${step.status}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {(status === 'success' || status === 'error') && onClose && (
          <button 
            className="btn"
            onClick={onClose}
            style={{
              background: status === 'success' ? 'var(--web3-success)' : 'var(--web3-error)',
              color: 'white',
              marginTop: 'var(--space-4)'
            }}
          >
            {status === 'success' ? 'Continue' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};

interface Web3StatusBadgeProps {
  status: 'connected' | 'pending' | 'error' | 'blockchain' | 'local';
  icon: string;
  text: string;
  onClick?: () => void;
}

export const Web3StatusBadge: React.FC<Web3StatusBadgeProps> = ({
  status,
  icon,
  text,
  onClick
}) => {
  return (
    <div 
      className={`web3-status-badge ${status}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <span className="status-badge-icon">{icon}</span>
      <span className="status-badge-text">{text}</span>
    </div>
  );
};

interface Web3LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const Web3LoadingSpinner: React.FC<Web3LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'var(--primary-orange)'
}) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  return (
    <div 
      className="web3-loading-spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size]
      }}
    />
  );
};

interface Web3NotificationProps {
  type: 'achievement' | 'leaderboard' | 'transaction' | 'error';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const Web3Notification: React.FC<Web3NotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoHide = true,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, duration, onClose]);

  if (!isVisible) return null;

  const getTypeIcon = () => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'leaderboard':
        return '📋';
      case 'transaction':
        return '⛓️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'achievement':
        return 'notification-achievement';
      case 'leaderboard':
        return 'notification-leaderboard';
      case 'transaction':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      default:
        return 'notification-success';
    }
  };

  return (
    <div className={`notification visible ${getTypeClass()}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {getTypeIcon()}
        </div>
        <div className="notification-text">
          <div className="notification-title">{title}</div>
          <div className="notification-message">{message}</div>
        </div>
        <button 
          className="notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Hook for managing Web3 feedback state
export const useWeb3Feedback = () => {
  const [transactionProgress, setTransactionProgress] = React.useState<{
    isVisible: boolean;
    title: string;
    message: string;
    steps: TransactionStep[];
    status: 'pending' | 'success' | 'error';
  }>({
    isVisible: false,
    title: '',
    message: '',
    steps: [],
    status: 'pending'
  });

  const showTransactionProgress = (
    title: string,
    message: string,
    steps: TransactionStep[] = []
  ) => {
    setTransactionProgress({
      isVisible: true,
      title,
      message,
      steps,
      status: 'pending'
    });
  };

  const updateTransactionProgress = (
    status: 'pending' | 'success' | 'error',
    message?: string,
    steps?: TransactionStep[]
  ) => {
    setTransactionProgress(prev => ({
      ...prev,
      status,
      message: message || prev.message,
      steps: steps || prev.steps
    }));
  };

  const hideTransactionProgress = () => {
    setTransactionProgress(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    transactionProgress,
    showTransactionProgress,
    updateTransactionProgress,
    hideTransactionProgress
  };
};
