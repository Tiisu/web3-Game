// Seamless Transaction Flow Component
// Integrates blockchain transactions with game experience

import React, { useState, useEffect } from 'react';
import { Web3TransactionProgress, TransactionStep, useWeb3Feedback } from './Web3Feedback';
import '../styles/TransactionFlow.css';

export interface TransactionFlowProps {
  type: 'registration' | 'gameStart' | 'gameComplete' | 'achievement';
  isVisible: boolean;
  onComplete: () => void;
  onCancel?: () => void;
  gameContext?: {
    score?: number;
    level?: number;
    molesHit?: number;
    achievement?: string;
  };
}

export const TransactionFlow: React.FC<TransactionFlowProps> = ({
  type,
  isVisible,
  onComplete,
  onCancel,
  gameContext
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const { transactionProgress, showTransactionProgress, updateTransactionProgress, hideTransactionProgress } = useWeb3Feedback();

  const getTransactionConfig = () => {
    switch (type) {
      case 'registration':
        return {
          title: '🎮 Join the Game',
          message: 'Register your player profile on the blockchain to unlock achievements and compete on the leaderboard!',
          steps: [
            { id: 'prepare', label: 'Prepare', icon: '⚙️', status: 'completed' as const },
            { id: 'sign', label: 'Sign Transaction', icon: '✍️', status: 'active' as const },
            { id: 'confirm', label: 'Blockchain Confirm', icon: '⛓️', status: 'pending' as const },
            { id: 'complete', label: 'Welcome!', icon: '🎉', status: 'pending' as const }
          ]
        };
      
      case 'gameStart':
        return {
          title: '🎯 Start Game Session',
          message: 'Starting a new game session on the blockchain. Your score will be recorded for achievements and leaderboard!',
          steps: [
            { id: 'prepare', label: 'Initialize', icon: '🎮', status: 'completed' as const },
            { id: 'sign', label: 'Sign Transaction', icon: '✍️', status: 'active' as const },
            { id: 'confirm', label: 'Session Created', icon: '⛓️', status: 'pending' as const },
            { id: 'play', label: 'Ready to Play!', icon: '🚀', status: 'pending' as const }
          ]
        };
      
      case 'gameComplete':
        return {
          title: '🏆 Game Complete',
          message: `Amazing game! Score: ${gameContext?.score || 0} | Level: ${gameContext?.level || 1} | Moles Hit: ${gameContext?.molesHit || 0}`,
          steps: [
            { id: 'calculate', label: 'Calculate Score', icon: '🧮', status: 'completed' as const },
            { id: 'sign', label: 'Sign Transaction', icon: '✍️', status: 'active' as const },
            { id: 'record', label: 'Record on Chain', icon: '⛓️', status: 'pending' as const },
            { id: 'rewards', label: 'Check Rewards', icon: '🎁', status: 'pending' as const }
          ]
        };
      
      case 'achievement':
        return {
          title: '🏆 Achievement Unlocked!',
          message: `Congratulations! You've earned the "${gameContext?.achievement}" achievement NFT!`,
          steps: [
            { id: 'qualify', label: 'Qualified', icon: '✅', status: 'completed' as const },
            { id: 'mint', label: 'Mint NFT', icon: '✍️', status: 'active' as const },
            { id: 'confirm', label: 'Blockchain Confirm', icon: '⛓️', status: 'pending' as const },
            { id: 'celebrate', label: 'Celebrate!', icon: '🎉', status: 'pending' as const }
          ]
        };
      
      default:
        return {
          title: 'Transaction',
          message: 'Processing blockchain transaction...',
          steps: []
        };
    }
  };

  const config = getTransactionConfig();

  useEffect(() => {
    if (isVisible) {
      showTransactionProgress(config.title, config.message, config.steps);
      simulateTransactionFlow();
    } else {
      hideTransactionProgress();
    }
  }, [isVisible, type]);

  const simulateTransactionFlow = async () => {
    const steps = [...config.steps];
    
    // Step 1: User signs transaction (simulated delay)
    setTimeout(() => {
      steps[1].status = 'completed';
      steps[2].status = 'active';
      updateTransactionProgress('pending', 'Waiting for blockchain confirmation...', steps);
    }, 2000);

    // Step 2: Blockchain confirmation (simulated delay)
    setTimeout(() => {
      steps[2].status = 'completed';
      steps[3].status = 'active';
      updateTransactionProgress('pending', 'Finalizing transaction...', steps);
    }, 4000);

    // Step 3: Complete
    setTimeout(() => {
      steps[3].status = 'completed';
      updateTransactionProgress('success', getSuccessMessage(), steps);
      
      // Auto-close after success
      setTimeout(() => {
        onComplete();
      }, 2000);
    }, 6000);
  };

  const getSuccessMessage = () => {
    switch (type) {
      case 'registration':
        return '🎉 Welcome to the game! You can now earn achievements and compete on the leaderboard!';
      case 'gameStart':
        return '🚀 Game session started! Your score will be tracked on the blockchain!';
      case 'gameComplete':
        return '✅ Game completed and recorded! Check your achievements and leaderboard position!';
      case 'achievement':
        return `🏆 Achievement NFT minted! "${gameContext?.achievement}" is now in your wallet!`;
      default:
        return 'Transaction completed successfully!';
    }
  };

  const handleClose = () => {
    hideTransactionProgress();
    if (status === 'success') {
      onComplete();
    } else if (onCancel) {
      onCancel();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <Web3TransactionProgress
        isVisible={transactionProgress.isVisible}
        title={transactionProgress.title}
        message={transactionProgress.message}
        steps={transactionProgress.steps}
        status={transactionProgress.status}
        onClose={handleClose}
      />
      
      {/* Game-themed overlay effects */}
      <div className={`transaction-game-overlay ${type}`}>
        <div className="game-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`particle particle-${i % 4}`} />
          ))}
        </div>
        
        {type === 'achievement' && (
          <div className="achievement-celebration">
            <div className="celebration-burst">🎉</div>
            <div className="celebration-burst">🏆</div>
            <div className="celebration-burst">✨</div>
            <div className="celebration-burst">🎊</div>
          </div>
        )}
        
        {type === 'gameComplete' && gameContext?.score && (
          <div className="score-celebration">
            <div className="floating-score">+{gameContext.score}</div>
            <div className="floating-text">Level {gameContext.level}</div>
            <div className="floating-text">{gameContext.molesHit} Moles Hit!</div>
          </div>
        )}
      </div>
    </>
  );
};

// Hook for managing transaction flows
export const useTransactionFlow = () => {
  const [activeFlow, setActiveFlow] = useState<{
    type: TransactionFlowProps['type'];
    gameContext?: TransactionFlowProps['gameContext'];
  } | null>(null);

  const startFlow = (
    type: TransactionFlowProps['type'],
    gameContext?: TransactionFlowProps['gameContext']
  ) => {
    setActiveFlow({ type, gameContext });
  };

  const completeFlow = () => {
    setActiveFlow(null);
  };

  const cancelFlow = () => {
    setActiveFlow(null);
  };

  return {
    activeFlow,
    startFlow,
    completeFlow,
    cancelFlow
  };
};

export default TransactionFlow;
