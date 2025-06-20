// App Context for managing overall application state and navigation

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTrialAccess } from '../hooks/useTrialAccess';
import { useWeb3 } from './Web3Context';

export type AppView = 'landing' | 'game';

export type UserAccessLevel = 
  | 'trial_available'    // User hasn't used trial yet
  | 'trial_active'       // User is currently in trial
  | 'trial_used'         // User has used trial but not connected
  | 'connected_unregistered' // Wallet connected but not registered
  | 'fully_registered';  // Wallet connected and registered

interface AppContextType {
  currentView: AppView;
  userAccessLevel: UserAccessLevel;
  canPlayGame: boolean;
  navigateToGame: () => void;
  navigateToLanding: () => void;
  startTrialGame: () => void;
  endCurrentGame: () => void;
  // Trial access methods
  hasUsedTrial: boolean;
  isTrialActive: boolean;
  canStartTrial: boolean;
  trialGamesPlayed: number;
  resetTrial: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const { web3State } = useWeb3();
  const {
    hasUsedTrial,
    isTrialActive,
    canStartTrial,
    trialGamesPlayed,
    startTrial,
    endTrial,
    incrementTrialGames,
    resetTrial
  } = useTrialAccess();

  // Determine user access level based on Web3 state and trial status
  const userAccessLevel: UserAccessLevel = React.useMemo(() => {
    if (web3State.isConnected && web3State.playerData?.isRegistered) {
      return 'fully_registered';
    }
    
    if (web3State.isConnected && !web3State.playerData?.isRegistered) {
      return 'connected_unregistered';
    }
    
    if (isTrialActive) {
      return 'trial_active';
    }
    
    if (hasUsedTrial) {
      return 'trial_used';
    }
    
    return 'trial_available';
  }, [web3State.isConnected, web3State.playerData?.isRegistered, isTrialActive, hasUsedTrial]);

  // Determine if user can play the game
  const canPlayGame = React.useMemo(() => {
    switch (userAccessLevel) {
      case 'fully_registered':
        return true;
      case 'trial_available':
        return canStartTrial;
      case 'trial_active':
        return true;
      case 'connected_unregistered':
        return false; // Must register first
      case 'trial_used':
        return false; // Must connect wallet
      default:
        return false;
    }
  }, [userAccessLevel, canStartTrial]);

  // Navigation methods
  const navigateToGame = useCallback(() => {
    if (canPlayGame) {
      setCurrentView('game');
    } else {
      console.warn('Cannot navigate to game: user does not have access');
    }
  }, [canPlayGame]);

  const navigateToLanding = useCallback(() => {
    setCurrentView('landing');
  }, []);

  // Start trial game
  const startTrialGame = useCallback(() => {
    if (userAccessLevel === 'trial_available' && canStartTrial) {
      startTrial();
      setCurrentView('game');
    } else {
      console.warn('Cannot start trial game: conditions not met');
    }
  }, [userAccessLevel, canStartTrial, startTrial]);

  // End current game
  const endCurrentGame = useCallback(() => {
    if (userAccessLevel === 'trial_active') {
      incrementTrialGames();
      endTrial();
      // Navigate back to landing after trial ends
      setCurrentView('landing');
    }
    // For registered users, they can continue playing
  }, [userAccessLevel, incrementTrialGames, endTrial]);

  // Auto-navigate based on user state changes
  useEffect(() => {
    // If user becomes fully registered while on landing, they can stay or go to game
    // If user's trial ends, navigate back to landing
    if (userAccessLevel === 'trial_used' && currentView === 'game') {
      setCurrentView('landing');
    }
  }, [userAccessLevel, currentView]);

  // Debug logging
  useEffect(() => {
    console.log('AppContext State:', {
      currentView,
      userAccessLevel,
      canPlayGame,
      web3Connected: web3State.isConnected,
      playerRegistered: web3State.playerData?.isRegistered,
      hasUsedTrial,
      isTrialActive,
      trialGamesPlayed
    });
  }, [
    currentView,
    userAccessLevel,
    canPlayGame,
    web3State.isConnected,
    web3State.playerData?.isRegistered,
    hasUsedTrial,
    isTrialActive,
    trialGamesPlayed
  ]);

  const contextValue: AppContextType = {
    currentView,
    userAccessLevel,
    canPlayGame,
    navigateToGame,
    navigateToLanding,
    startTrialGame,
    endCurrentGame,
    hasUsedTrial,
    isTrialActive,
    canStartTrial,
    trialGamesPlayed,
    resetTrial
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
