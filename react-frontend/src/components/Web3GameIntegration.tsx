// Web3 Game Integration Component
// Orchestrates all enhanced Web3 UI/UX features for seamless gameplay

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import { useNotifications } from '../hooks/useNotifications';
import { Web3TransactionProgress, useWeb3Feedback } from './Web3Feedback';
import { TransactionFlow, useTransactionFlow } from './TransactionFlow';
import { Web3Onboarding, useWeb3Onboarding } from './Web3Onboarding';
import { AchievementCelebration, useAchievementCelebration } from './AchievementCelebration';

interface Web3GameIntegrationProps {
  children: React.ReactNode;
}

export const Web3GameIntegration: React.FC<Web3GameIntegrationProps> = ({ children }) => {
  const { web3State, pendingTransaction } = useWeb3();
  const { gameState } = useGameContext();
  const { addNotification } = useNotifications();
  
  // Enhanced feedback systems
  const { transactionProgress, showTransactionProgress, hideTransactionProgress } = useWeb3Feedback();
  const { activeFlow, startFlow, completeFlow } = useTransactionFlow();
  const { showOnboarding, shouldShowOnboarding, startOnboarding, completeOnboarding } = useWeb3Onboarding();
  const { celebration, showAchievementUnlock, showLeaderboardUpdate, hideCelebration } = useAchievementCelebration();

  // Track previous states for comparison
  const [prevAchievements, setPrevAchievements] = useState(web3State.achievements.length);
  const [prevLeaderboardPosition, setPrevLeaderboardPosition] = useState<number | null>(null);
  const [prevGameState, setPrevGameState] = useState(gameState.isPlaying);

  // Handle achievement unlocks
  useEffect(() => {
    if (web3State.achievements.length > prevAchievements) {
      const newAchievement = web3State.achievements[web3State.achievements.length - 1];
      showAchievementUnlock(newAchievement, 'rare');
      addNotification({
        type: 'achievement',
        title: 'Achievement Unlocked! 🏆',
        message: `You've earned the "${newAchievement}" NFT!`,
        autoHide: true
      });
    }
    setPrevAchievements(web3State.achievements.length);
  }, [web3State.achievements.length, prevAchievements, showAchievementUnlock, addNotification]);

  // Handle leaderboard updates
  useEffect(() => {
    if (web3State.leaderboard.length > 0 && web3State.account) {
      const currentPosition = web3State.leaderboard.findIndex(
        entry => entry.player.toLowerCase() === web3State.account?.toLowerCase()
      ) + 1;

      if (currentPosition > 0 && prevLeaderboardPosition && currentPosition < prevLeaderboardPosition) {
        showLeaderboardUpdate(currentPosition, web3State.playerData?.highestScore || 0);
        addNotification({
          type: 'leaderboard',
          title: 'Leaderboard Updated! 📋',
          message: `You've climbed to position #${currentPosition}!`,
          autoHide: true
        });
      }
      setPrevLeaderboardPosition(currentPosition || null);
    }
  }, [web3State.leaderboard, web3State.account, web3State.playerData?.highestScore, prevLeaderboardPosition, showLeaderboardUpdate, addNotification]);

  // Handle game state transitions for Web3 flows
  useEffect(() => {
    if (prevGameState === true && gameState.gameOver && web3State.isConnected) {
      // Game completed - start transaction flow for score recording
      startFlow('gameComplete', {
        score: gameState.score,
        level: gameState.currentLevel,
        molesHit: gameState.molesHit
      });
    }
    setPrevGameState(gameState.isPlaying);
  }, [gameState.isPlaying, gameState.gameOver, prevGameState, web3State.isConnected, gameState.score, gameState.currentLevel, gameState.molesHit, startFlow]);

  // Handle onboarding trigger
  useEffect(() => {
    if (shouldShowOnboarding() && !showOnboarding) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 2000); // Show onboarding 2 seconds after trial completion

      return () => clearTimeout(timer);
    }
  }, [shouldShowOnboarding, showOnboarding, startOnboarding]);

  // Handle transaction flow completion
  const handleTransactionFlowComplete = () => {
    completeFlow();
    
    // Show success notification
    addNotification({
      type: 'success',
      title: 'Transaction Complete! ✅',
      message: 'Your game data has been recorded on the blockchain.',
      autoHide: true
    });
  };

  return (
    <>
      {children}
      
      {/* Transaction Flow */}
      {activeFlow && (
        <TransactionFlow
          type={activeFlow.type}
          isVisible={true}
          onComplete={handleTransactionFlowComplete}
          gameContext={activeFlow.gameContext}
        />
      )}
      
      {/* Web3 Onboarding */}
      <Web3Onboarding
        isVisible={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={completeOnboarding}
      />
      
      {/* Achievement Celebration */}
      {celebration && (
        <AchievementCelebration
          type={celebration.type}
          isVisible={celebration.isVisible}
          onComplete={hideCelebration}
          data={celebration.data}
        />
      )}
      
      {/* Enhanced Transaction Progress */}
      <Web3TransactionProgress
        isVisible={transactionProgress.isVisible}
        title={transactionProgress.title}
        message={transactionProgress.message}
        steps={transactionProgress.steps}
        status={transactionProgress.status}
        onClose={hideTransactionProgress}
      />
    </>
  );
};

// Hook for managing the overall Web3 game experience
export const useWeb3GameExperience = () => {
  const { web3State } = useWeb3();
  const { gameState } = useGameContext();
  
  const getExperienceStatus = () => {
    if (!web3State.isConnected) {
      return {
        mode: 'local' as const,
        message: 'Playing in local mode',
        canEarnAchievements: false,
        canCompeteOnLeaderboard: false
      };
    }
    
    if (!web3State.playerData?.isRegistered) {
      return {
        mode: 'connected' as const,
        message: 'Wallet connected - registration required',
        canEarnAchievements: false,
        canCompeteOnLeaderboard: false
      };
    }
    
    return {
      mode: 'web3' as const,
      message: 'Full Web3 experience active',
      canEarnAchievements: true,
      canCompeteOnLeaderboard: true
    };
  };
  
  const getGameProgress = () => {
    const playerData = web3State.playerData;
    if (!playerData) return null;
    
    const level = Math.floor(playerData.totalScore / 1000) + 1;
    const progressInLevel = (playerData.totalScore % 1000) / 1000;
    const nextAchievementScore = Math.ceil(playerData.totalScore / 5000) * 5000;
    
    return {
      level,
      progressInLevel,
      nextAchievementScore,
      totalAchievements: web3State.achievements.length,
      leaderboardPosition: web3State.leaderboard.findIndex(
        entry => entry.player.toLowerCase() === web3State.account?.toLowerCase()
      ) + 1 || null
    };
  };
  
  return {
    experienceStatus: getExperienceStatus(),
    gameProgress: getGameProgress(),
    isWeb3Active: web3State.isConnected && web3State.playerData?.isRegistered
  };
};

export default Web3GameIntegration;
