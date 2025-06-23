// Advanced effects hook for managing visual effects and animations

import { useEffect, useCallback, useRef } from 'react';

interface EffectOptions {
  duration?: number;
  intensity?: 'light' | 'medium' | 'intense';
  element?: HTMLElement | null;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  currentStreak: number;
  currentLevel: number;
  timeLeft: number;
}

export const useAdvancedEffects = (gameState: GameState) => {
  const lastScoreRef = useRef(0);
  const lastStreakRef = useRef(0);
  const lastLevelRef = useRef(1);
  const effectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Screen shake effect
  const triggerScreenShake = useCallback((intensity: 'light' | 'medium' | 'intense' = 'medium', element?: HTMLElement) => {
    const target = element || document.body;
    const className = intensity === 'light' ? 'screen-shake' : 
                     intensity === 'intense' ? 'screen-shake-intense' : 
                     'screen-shake';
    
    target.classList.add(className);
    
    setTimeout(() => {
      target.classList.remove(className);
    }, intensity === 'intense' ? 800 : intensity === 'light' ? 300 : 500);
  }, []);

  // Combo screen shake
  const triggerComboShake = useCallback((element?: HTMLElement) => {
    const target = element || document.body;
    target.classList.add('screen-shake-combo');
    
    setTimeout(() => {
      target.classList.remove('screen-shake-combo');
    }, 1000);
  }, []);

  // Special event flash
  const triggerSpecialFlash = useCallback((element?: HTMLElement) => {
    const target = element || document.querySelector('.game-container') as HTMLElement;
    if (target) {
      target.classList.add('special-event-flash');
      
      setTimeout(() => {
        target.classList.remove('special-event-flash');
      }, 1000);
    }
  }, []);

  // Level up celebration
  const triggerLevelUpCelebration = useCallback((element?: HTMLElement) => {
    const target = element || document.querySelector('.game-board') as HTMLElement;
    if (target) {
      target.classList.add('level-up-celebration');
      
      setTimeout(() => {
        target.classList.remove('level-up-celebration');
      }, 2000);
    }
  }, []);

  // Combo celebration
  const triggerComboCelebration = useCallback((element?: HTMLElement) => {
    const target = element || document.querySelector('.game-board') as HTMLElement;
    if (target) {
      target.classList.add('combo-celebration');
      
      setTimeout(() => {
        target.classList.remove('combo-celebration');
      }, 1500);
    }
  }, []);

  // Achievement unlock animation
  const triggerAchievementUnlock = useCallback((element?: HTMLElement) => {
    const target = element || document.querySelector('.achievements-section') as HTMLElement;
    if (target) {
      target.classList.add('achievement-unlock');
      
      setTimeout(() => {
        target.classList.remove('achievement-unlock');
      }, 2500);
    }
  }, []);

  // Game state transition effects
  const applyGameStateEffect = useCallback((state: 'starting' | 'playing' | 'paused' | 'ended', element?: HTMLElement) => {
    const target = element || document.querySelector('.game-container') as HTMLElement;
    if (target) {
      // Remove all state classes
      target.classList.remove('game-state-starting', 'game-state-playing', 'game-state-paused', 'game-state-ended');
      
      // Add new state class
      target.classList.add(`game-state-${state}`);
      
      // Auto-remove after animation
      const duration = state === 'starting' ? 2000 : 
                      state === 'playing' ? 1000 : 
                      state === 'ended' ? 1500 : 0;
      
      if (duration > 0) {
        setTimeout(() => {
          target.classList.remove(`game-state-${state}`);
        }, duration);
      }
    }
  }, []);

  // Mole hit effect with screen shake
  const triggerMoleHitEffect = useCallback((position: { x: number; y: number }, isSpecial: boolean = false) => {
    // Screen shake based on hit type
    if (isSpecial) {
      triggerScreenShake('intense');
    } else {
      triggerScreenShake('light');
    }

    // Create hit effect at position
    const hitEffect = document.createElement('div');
    hitEffect.className = 'hit-effect-burst';
    hitEffect.style.position = 'absolute';
    hitEffect.style.left = `${position.x}px`;
    hitEffect.style.top = `${position.y}px`;
    hitEffect.style.width = '20px';
    hitEffect.style.height = '20px';
    hitEffect.style.background = 'radial-gradient(circle, rgba(76, 175, 80, 0.8) 0%, transparent 70%)';
    hitEffect.style.borderRadius = '50%';
    hitEffect.style.pointerEvents = 'none';
    hitEffect.style.zIndex = '1000';
    hitEffect.style.animation = 'hitBurst 0.6s ease-out forwards';

    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      gameBoard.appendChild(hitEffect);
      
      setTimeout(() => {
        if (hitEffect.parentNode) {
          hitEffect.parentNode.removeChild(hitEffect);
        }
      }, 600);
    }
  }, [triggerScreenShake]);

  // Miss effect
  const triggerMissEffect = useCallback((position: { x: number; y: number }) => {
    // Light screen shake for miss
    triggerScreenShake('light');

    // Create miss effect
    const missEffect = document.createElement('div');
    missEffect.className = 'miss-effect-puff';
    missEffect.style.position = 'absolute';
    missEffect.style.left = `${position.x}px`;
    missEffect.style.top = `${position.y}px`;
    missEffect.style.width = '15px';
    missEffect.style.height = '15px';
    missEffect.style.background = 'radial-gradient(circle, rgba(158, 158, 158, 0.6) 0%, transparent 70%)';
    missEffect.style.borderRadius = '50%';
    missEffect.style.pointerEvents = 'none';
    missEffect.style.zIndex = '1000';
    missEffect.style.animation = 'missPuff 0.4s ease-out forwards';

    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      gameBoard.appendChild(missEffect);
      
      setTimeout(() => {
        if (missEffect.parentNode) {
          missEffect.parentNode.removeChild(missEffect);
        }
      }, 400);
    }
  }, [triggerScreenShake]);

  // Auto-trigger effects based on game state changes
  useEffect(() => {
    // Score increase effects
    if (gameState.score > lastScoreRef.current && gameState.isPlaying) {
      const scoreIncrease = gameState.score - lastScoreRef.current;
      
      if (scoreIncrease >= 100) {
        triggerSpecialFlash();
      }
    }
    lastScoreRef.current = gameState.score;

    // Streak effects
    if (gameState.currentStreak > lastStreakRef.current && gameState.isPlaying) {
      if (gameState.currentStreak >= 5 && gameState.currentStreak % 5 === 0) {
        triggerComboCelebration();
        triggerComboShake();
      }
    }
    lastStreakRef.current = gameState.currentStreak;

    // Level up effects
    if (gameState.currentLevel > lastLevelRef.current) {
      triggerLevelUpCelebration();
      triggerSpecialFlash();
    }
    lastLevelRef.current = gameState.currentLevel;

    // Game state effects
    if (gameState.isPlaying && !gameState.isPaused) {
      applyGameStateEffect('playing');
    } else if (gameState.isPaused) {
      applyGameStateEffect('paused');
    }
  }, [gameState, triggerSpecialFlash, triggerComboCelebration, triggerComboShake, triggerLevelUpCelebration, applyGameStateEffect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
    };
  }, []);

  // Add ambient background effects
  const addAmbientEffects = useCallback((container?: HTMLElement) => {
    const target = container || document.querySelector('.game-container') as HTMLElement;
    if (target && !target.querySelector('.ambient-background')) {
      const ambientBg = document.createElement('div');
      ambientBg.className = 'ambient-background';
      
      // Create ambient orbs
      for (let i = 0; i < 4; i++) {
        const orb = document.createElement('div');
        orb.className = 'ambient-orb';
        ambientBg.appendChild(orb);
      }
      
      target.appendChild(ambientBg);
    }
  }, []);

  // Remove ambient effects
  const removeAmbientEffects = useCallback((container?: HTMLElement) => {
    const target = container || document.querySelector('.game-container') as HTMLElement;
    if (target) {
      const ambientBg = target.querySelector('.ambient-background');
      if (ambientBg) {
        ambientBg.remove();
      }
    }
  }, []);

  return {
    triggerScreenShake,
    triggerComboShake,
    triggerSpecialFlash,
    triggerLevelUpCelebration,
    triggerComboCelebration,
    triggerAchievementUnlock,
    triggerMoleHitEffect,
    triggerMissEffect,
    applyGameStateEffect,
    addAmbientEffects,
    removeAmbientEffects
  };
};
