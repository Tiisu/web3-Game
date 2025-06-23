// Accessibility hook for managing ARIA labels, keyboard navigation, and screen reader support

import { useEffect, useCallback, useRef, useState } from 'react';

interface AccessibilityOptions {
  enableKeyboardNavigation?: boolean;
  enableScreenReader?: boolean;
  enableFocusManagement?: boolean;
  announceChanges?: boolean;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  currentStreak: number;
  currentLevel: number;
  timeLeft: number;
  gameOver: boolean;
}

export const useAccessibility = (gameState: GameState, options: AccessibilityOptions = {}) => {
  const {
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableFocusManagement = true,
    announceChanges = true
  } = options;

  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  
  const ariaLiveRef = useRef<HTMLDivElement | null>(null);
  const lastAnnouncementRef = useRef<string>('');
  const keyboardNavigationRef = useRef<HTMLElement[]>([]);

  // Detect user preferences
  useEffect(() => {
    const checkPreferences = () => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      setHighContrast(window.matchMedia('(prefers-contrast: high)').matches);
    };

    checkPreferences();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    motionQuery.addEventListener('change', checkPreferences);
    contrastQuery.addEventListener('change', checkPreferences);

    return () => {
      motionQuery.removeEventListener('change', checkPreferences);
      contrastQuery.removeEventListener('change', checkPreferences);
    };
  }, []);

  // Create ARIA live region
  useEffect(() => {
    if (!enableScreenReader) return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'aria-live-region sr-only';
    liveRegion.id = 'game-announcements';
    
    document.body.appendChild(liveRegion);
    ariaLiveRef.current = liveRegion;

    return () => {
      if (ariaLiveRef.current) {
        document.body.removeChild(ariaLiveRef.current);
      }
    };
  }, [enableScreenReader]);

  // Announce game state changes
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges || !ariaLiveRef.current || message === lastAnnouncementRef.current) return;

    ariaLiveRef.current.setAttribute('aria-live', priority);
    ariaLiveRef.current.textContent = message;
    lastAnnouncementRef.current = message;

    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = '';
      }
      lastAnnouncementRef.current = '';
    }, 1000);
  }, [announceChanges]);

  // Game state announcements
  useEffect(() => {
    if (!gameState.isPlaying && !gameState.gameOver) return;

    if (gameState.gameOver) {
      announce(`Game over! Final score: ${gameState.score}`, 'assertive');
    } else if (gameState.isPaused) {
      announce('Game paused', 'polite');
    } else if (gameState.currentStreak >= 5) {
      announce(`Amazing! ${gameState.currentStreak} hit streak!`, 'polite');
    } else if (gameState.currentLevel > 1) {
      announce(`Level ${gameState.currentLevel} reached!`, 'polite');
    }
  }, [gameState, announce]);

  // Score announcements (throttled)
  useEffect(() => {
    if (!gameState.isPlaying || gameState.score === 0) return;

    const scoreThresholds = [100, 500, 1000, 2000, 5000, 10000];
    const threshold = scoreThresholds.find(t => gameState.score >= t && gameState.score < t + 50);
    
    if (threshold) {
      announce(`Score milestone: ${threshold} points!`, 'polite');
    }
  }, [gameState.score, gameState.isPlaying, announce]);

  // Keyboard navigation setup
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const updateNavigableElements = () => {
      const elements = Array.from(document.querySelectorAll(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"]), .board-cell, .control-btn, .header-action-btn'
      )) as HTMLElement[];
      
      keyboardNavigationRef.current = elements;
    };

    updateNavigableElements();

    // Update when DOM changes
    const observer = new MutationObserver(updateNavigableElements);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [enableKeyboardNavigation]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enableKeyboardNavigation) return;

    const { key, ctrlKey, altKey, shiftKey } = event;
    const elements = keyboardNavigationRef.current;
    const currentIndex = elements.findIndex(el => el === document.activeElement);

    switch (key) {
      case 'Tab':
        // Enhanced tab navigation
        if (!shiftKey && currentIndex === elements.length - 1) {
          event.preventDefault();
          elements[0]?.focus();
        } else if (shiftKey && currentIndex === 0) {
          event.preventDefault();
          elements[elements.length - 1]?.focus();
        }
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % elements.length;
        elements[nextIndex]?.focus();
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
        elements[prevIndex]?.focus();
        break;

      case 'Home':
        if (ctrlKey) {
          event.preventDefault();
          elements[0]?.focus();
        }
        break;

      case 'End':
        if (ctrlKey) {
          event.preventDefault();
          elements[elements.length - 1]?.focus();
        }
        break;

      case 'Escape':
        event.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
        announce('Focus cleared', 'polite');
        break;

      case ' ':
      case 'Enter':
        if (document.activeElement instanceof HTMLElement) {
          const element = document.activeElement;
          if (element.classList.contains('board-cell') || element.classList.contains('control-btn')) {
            event.preventDefault();
            element.click();
          }
        }
        break;
    }
  }, [enableKeyboardNavigation, announce]);

  // Set up keyboard listeners
  useEffect(() => {
    if (enableKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableKeyboardNavigation, handleKeyDown]);

  // Focus management
  const manageFocus = useCallback((element: HTMLElement | null) => {
    if (!enableFocusManagement) return;

    if (element) {
      element.focus();
      setFocusedElement(element);
      
      // Announce focus change for screen readers
      const label = element.getAttribute('aria-label') || 
                   element.getAttribute('title') || 
                   element.textContent || 
                   'Interactive element';
      announce(`Focused on ${label}`, 'polite');
    }
  }, [enableFocusManagement, announce]);

  // Add ARIA labels to elements
  const addAriaLabel = useCallback((element: HTMLElement, label: string, description?: string) => {
    element.setAttribute('aria-label', label);
    if (description) {
      element.setAttribute('aria-describedby', `${element.id || 'element'}-description`);
      
      // Create description element if it doesn't exist
      let descElement = document.getElementById(`${element.id || 'element'}-description`);
      if (!descElement) {
        descElement = document.createElement('div');
        descElement.id = `${element.id || 'element'}-description`;
        descElement.className = 'sr-only';
        descElement.textContent = description;
        document.body.appendChild(descElement);
      }
    }
  }, []);

  // Add keyboard hints
  const addKeyboardHint = useCallback((element: HTMLElement, hint: string) => {
    const hintElement = document.createElement('div');
    hintElement.className = 'keyboard-hint';
    hintElement.textContent = hint;
    
    element.style.position = 'relative';
    element.appendChild(hintElement);
    element.classList.add('keyboard-navigable');
  }, []);

  // Create skip link
  const createSkipLink = useCallback((targetId: string, text: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-link';
    skipLink.textContent = text;
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    return skipLink;
  }, []);

  // Apply accessibility enhancements to game elements
  const enhanceGameAccessibility = useCallback(() => {
    // Add ARIA labels to game board cells
    const cells = document.querySelectorAll('.board-cell');
    cells.forEach((cell, index) => {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      addAriaLabel(
        cell as HTMLElement,
        `Game cell row ${row}, column ${col}`,
        'Click to hit mole if present'
      );
    });

    // Add ARIA labels to control buttons
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
      addAriaLabel(startBtn as HTMLElement, 'Start game', 'Press Space or Enter to start playing');
    }

    const pauseBtn = document.querySelector('.pause-btn');
    if (pauseBtn) {
      addAriaLabel(pauseBtn as HTMLElement, 'Pause game', 'Press P to pause the game');
    }

    // Add ARIA live regions for game stats
    const scoreElement = document.querySelector('.stat-value');
    if (scoreElement) {
      scoreElement.setAttribute('aria-live', 'polite');
      scoreElement.setAttribute('aria-label', `Current score: ${gameState.score}`);
    }

    // Add keyboard hints
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      addKeyboardHint(gameBoard as HTMLElement, 'Use arrow keys to navigate, Space/Enter to hit');
    }
  }, [addAriaLabel, addKeyboardHint, gameState.score]);

  // Apply enhancements when component mounts or game state changes
  useEffect(() => {
    enhanceGameAccessibility();
  }, [enhanceGameAccessibility, gameState.isPlaying]);

  return {
    // State
    reducedMotion,
    highContrast,
    focusedElement,
    
    // Functions
    announce,
    manageFocus,
    addAriaLabel,
    addKeyboardHint,
    createSkipLink,
    enhanceGameAccessibility
  };
};
