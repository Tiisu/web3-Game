// Progressive Web3 Onboarding System
// Smooth, game-immersive introduction to Web3 features

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAppContext } from '../contexts/AppContext';
import '../styles/Web3Onboarding.css';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
  completed: boolean;
}

interface Web3OnboardingProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

export const Web3Onboarding: React.FC<Web3OnboardingProps> = ({
  isVisible,
  onComplete,
  onSkip
}) => {
  const { web3State, connect, registerPlayer } = useWeb3();
  const { hasUsedTrial } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const getOnboardingSteps = (): OnboardingStep[] => [
    {
      id: 'welcome',
      title: '🎮 Welcome to Web3 Gaming!',
      description: 'Experience the future of gaming with blockchain technology. Earn NFT achievements, compete on global leaderboards, and truly own your gaming progress!',
      icon: '🚀',
      completed: true
    },
    {
      id: 'wallet',
      title: '🔗 Connect Your Wallet',
      description: 'Connect your Web3 wallet to unlock blockchain features. Your wallet is your gaming identity and achievement vault.',
      icon: '👛',
      action: 'Connect Wallet',
      completed: web3State.isConnected
    },
    {
      id: 'register',
      title: '📝 Create Player Profile',
      description: 'Register your unique player profile on the blockchain. Choose a username and start your Web3 gaming journey!',
      icon: '👤',
      action: 'Register Profile',
      completed: web3State.playerData?.isRegistered || false
    },
    {
      id: 'features',
      title: '🏆 Unlock Features',
      description: 'Now you can earn NFT achievements, compete on the global leaderboard, and have your scores permanently recorded on ApeChain!',
      icon: '✨',
      completed: web3State.playerData?.isRegistered || false
    }
  ];

  const steps = getOnboardingSteps();
  const currentStepData = steps[currentStep];

  useEffect(() => {
    // Auto-advance to next incomplete step
    const nextIncompleteStep = steps.findIndex(step => !step.completed);
    if (nextIncompleteStep !== -1 && nextIncompleteStep !== currentStep) {
      setCurrentStep(nextIncompleteStep);
    }
  }, [web3State.isConnected, web3State.playerData?.isRegistered]);

  const handleStepAction = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      switch (currentStepData.id) {
        case 'wallet':
          await connect();
          break;
        case 'register':
          // This will be handled by the PlayerRegistration modal
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Onboarding action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="web3-onboarding-overlay">
      <div className="onboarding-container">
        {/* Background Game Elements */}
        <div className="onboarding-background">
          <div className="floating-mole">🦫</div>
          <div className="floating-mole">🦫</div>
          <div className="floating-mole">🦫</div>
          <div className="floating-achievement">🏆</div>
          <div className="floating-achievement">🎖️</div>
          <div className="floating-chain">⛓️</div>
        </div>

        <div className="onboarding-content">
          {/* Progress Indicator */}
          <div className="onboarding-progress">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`progress-step ${
                  index === currentStep ? 'active' : 
                  index < currentStep || step.completed ? 'completed' : 'pending'
                }`}
              >
                <div className="progress-icon">
                  {step.completed ? '✅' : step.icon}
                </div>
                <div className="progress-line" />
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="step-content">
            <div className="step-icon-large">
              {currentStepData.completed ? '✅' : currentStepData.icon}
            </div>
            
            <h2 className="step-title">{currentStepData.title}</h2>
            <p className="step-description">{currentStepData.description}</p>

            {/* Special content for different steps */}
            {currentStepData.id === 'welcome' && hasUsedTrial && (
              <div className="trial-reminder">
                <div className="trial-icon">🎯</div>
                <p>You've tried the game! Now unlock the full Web3 experience.</p>
              </div>
            )}

            {currentStepData.id === 'features' && (
              <div className="features-preview">
                <div className="feature-item">
                  <span className="feature-icon">🏆</span>
                  <span className="feature-text">NFT Achievements</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📋</span>
                  <span className="feature-text">Global Leaderboard</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⛓️</span>
                  <span className="feature-text">Blockchain Scores</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="onboarding-actions">
            {currentStep > 0 && (
              <button 
                className="onboarding-btn secondary"
                onClick={handlePrevious}
              >
                ← Previous
              </button>
            )}

            {currentStepData.action && !currentStepData.completed ? (
              <button 
                className={`onboarding-btn primary ${isProcessing ? 'loading' : ''}`}
                onClick={handleStepAction}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  currentStepData.action
                )}
              </button>
            ) : (
              <button 
                className="onboarding-btn primary"
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? 'Start Playing! 🎮' : 'Next →'}
              </button>
            )}

            <button 
              className="onboarding-btn skip"
              onClick={handleSkip}
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Close button */}
        <button 
          className="onboarding-close"
          onClick={handleSkip}
          aria-label="Close onboarding"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Hook for managing onboarding state
export const useWeb3Onboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { web3State } = useWeb3();
  const { hasUsedTrial } = useAppContext();

  const shouldShowOnboarding = () => {
    // Show onboarding if user has tried the game but hasn't connected wallet
    return hasUsedTrial && !web3State.isConnected;
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    shouldShowOnboarding,
    startOnboarding,
    completeOnboarding,
    skipOnboarding
  };
};

export default Web3Onboarding;
