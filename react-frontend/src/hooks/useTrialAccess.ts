// Custom hook for managing trial access logic

import { useState, useEffect, useCallback } from 'react';

interface TrialAccessState {
  hasUsedTrial: boolean;
  isTrialActive: boolean;
  trialGamesPlayed: number;
  trialStartTime: number | null;
}

interface UseTrialAccessReturn {
  hasUsedTrial: boolean;
  isTrialActive: boolean;
  canStartTrial: boolean;
  trialGamesPlayed: number;
  startTrial: () => void;
  endTrial: () => void;
  incrementTrialGames: () => void;
  resetTrial: () => void;
}

const TRIAL_STORAGE_KEY = 'whac-a-mole-trial-data';
const MAX_TRIAL_GAMES = 1;

export const useTrialAccess = (): UseTrialAccessReturn => {
  const [trialState, setTrialState] = useState<TrialAccessState>({
    hasUsedTrial: false,
    isTrialActive: false,
    trialGamesPlayed: 0,
    trialStartTime: null
  });

  // Load trial data from localStorage on mount
  useEffect(() => {
    const savedTrialData = localStorage.getItem(TRIAL_STORAGE_KEY);
    if (savedTrialData) {
      try {
        const parsedData = JSON.parse(savedTrialData);
        setTrialState(parsedData);
      } catch (error) {
        console.error('Failed to parse trial data:', error);
        // Reset trial data if corrupted
        localStorage.removeItem(TRIAL_STORAGE_KEY);
      }
    }
  }, []);

  // Save trial data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(trialState));
  }, [trialState]);

  // Check if user can start a trial
  const canStartTrial = !trialState.hasUsedTrial && !trialState.isTrialActive;

  // Start trial session
  const startTrial = useCallback(() => {
    if (!canStartTrial) {
      console.warn('Cannot start trial: trial already used or active');
      return;
    }

    setTrialState(prev => ({
      ...prev,
      isTrialActive: true,
      trialStartTime: Date.now()
    }));

    console.log('🎮 Trial session started');
  }, [canStartTrial]);

  // End trial session
  const endTrial = useCallback(() => {
    setTrialState(prev => ({
      ...prev,
      isTrialActive: false,
      hasUsedTrial: true,
      trialStartTime: null
    }));

    console.log('🎮 Trial session ended');
  }, []);

  // Increment trial games played
  const incrementTrialGames = useCallback(() => {
    setTrialState(prev => {
      const newGamesPlayed = prev.trialGamesPlayed + 1;
      
      // If max games reached, end trial
      if (newGamesPlayed >= MAX_TRIAL_GAMES) {
        return {
          ...prev,
          trialGamesPlayed: newGamesPlayed,
          isTrialActive: false,
          hasUsedTrial: true,
          trialStartTime: null
        };
      }

      return {
        ...prev,
        trialGamesPlayed: newGamesPlayed
      };
    });
  }, []);

  // Reset trial (for development/testing purposes)
  const resetTrial = useCallback(() => {
    const resetState: TrialAccessState = {
      hasUsedTrial: false,
      isTrialActive: false,
      trialGamesPlayed: 0,
      trialStartTime: null
    };
    
    setTrialState(resetState);
    localStorage.removeItem(TRIAL_STORAGE_KEY);
    
    console.log('🔄 Trial data reset');
  }, []);

  return {
    hasUsedTrial: trialState.hasUsedTrial,
    isTrialActive: trialState.isTrialActive,
    canStartTrial,
    trialGamesPlayed: trialState.trialGamesPlayed,
    startTrial,
    endTrial,
    incrementTrialGames,
    resetTrial
  };
};
