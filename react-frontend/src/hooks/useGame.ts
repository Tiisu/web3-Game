// Custom hook for game logic and state management

import { useState, useEffect, useCallback, useRef } from 'react';
import { UseGameReturn, GameState, GameStats, MoleData, GameSettings } from '../types';
import { GAME_CONFIG, DEFAULT_GAME_SETTINGS, STORAGE_KEYS } from '../config/web3Config';

export const useGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: GAME_CONFIG.DURATION,
    currentLevel: 1,
    pointsToNextLevel: GAME_CONFIG.LEVEL_CONFIG[0].pointsRequired,
    gameOver: true,
    isPaused: false,
    molesHit: 0,
    plantsHit: 0,
    isPlaying: false
  });

  // Game statistics
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      totalScore: 0,
      totalCoins: 0,
      bestTime: 0,
      highestLevel: 1,
      molesHit: 0,
      plantsHit: 0,
      averageScore: 0
    };
  });

  // Game settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_GAME_SETTINGS;
  });

  // Moles state
  const [moles, setMoles] = useState<MoleData[]>([]);

  // Refs for intervals
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const plantIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const difficultyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio refs
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Initialize audio
  useEffect(() => {
    const sounds = {
      'hit-sound': '/audio/hit.mp3',
      'miss-sound': '/audio/miss.mp3',
      'gameover-sound': '/audio/gameover.mp3',
      'levelup-sound': '/audio/levelup.mp3',
      'background-music': '/audio/background.mp3'
    };

    Object.entries(sounds).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      if (key === 'background-music') {
        audio.loop = true;
        audio.volume = 0.3;
      } else {
        audio.volume = 0.7;
      }
      audioRefs.current[key] = audio;
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  // Play sound effect
  const playSound = useCallback((soundName: string) => {
    if (!settings.soundEnabled) return;
    
    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  }, [settings.soundEnabled]);

  // Play background music
  const playBackgroundMusic = useCallback(() => {
    if (!settings.musicEnabled) return;
    
    const music = audioRefs.current['background-music'];
    if (music) {
      music.play().catch(console.error);
    }
  }, [settings.musicEnabled]);

  // Pause background music
  const pauseBackgroundMusic = useCallback(() => {
    const music = audioRefs.current['background-music'];
    if (music) {
      music.pause();
    }
  }, []);

  // Generate random mole
  const generateMole = useCallback((): MoleData => {
    const position = Math.floor(Math.random() * 9);
    const moleType = Math.random() < 0.7 ? 'mole1' : 'mole2';
    const points = GAME_CONFIG.MOLE_POINTS[moleType];
    
    return {
      id: `mole-${Date.now()}-${Math.random()}`,
      type: moleType,
      position,
      isVisible: true,
      points
    };
  }, []);

  // Generate plant
  const generatePlant = useCallback((): MoleData => {
    const position = Math.floor(Math.random() * 9);
    
    return {
      id: `plant-${Date.now()}-${Math.random()}`,
      type: 'plant',
      position,
      isVisible: true,
      points: 0
    };
  }, []);

  // Clear all intervals
  const clearAllIntervals = useCallback(() => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
    if (plantIntervalRef.current) clearInterval(plantIntervalRef.current);
    if (difficultyIntervalRef.current) clearInterval(difficultyIntervalRef.current);
  }, []);

  // Start game timer
  const startGameTimer = useCallback(() => {
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, gameOver: true, isPlaying: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, []);

  // Start mole spawning
  const startMoleSpawning = useCallback(() => {
    const currentLevelConfig = GAME_CONFIG.LEVEL_CONFIG[gameState.currentLevel - 1];
    const moleSpeed = currentLevelConfig?.moleSpeed || 1000;

    moleIntervalRef.current = setInterval(() => {
      if (Math.random() < 0.8) { // 80% chance to spawn mole
        const newMole = generateMole();
        setMoles(prev => [...prev, newMole]);

        // Remove mole after some time
        setTimeout(() => {
          setMoles(prev => prev.filter(m => m.id !== newMole.id));
        }, moleSpeed);
      }
    }, moleSpeed * 0.6);
  }, [gameState.currentLevel, generateMole]);

  // Start plant spawning
  const startPlantSpawning = useCallback(() => {
    const currentLevelConfig = GAME_CONFIG.LEVEL_CONFIG[gameState.currentLevel - 1];
    const plantSpeed = currentLevelConfig?.plantSpeed || 2000;

    plantIntervalRef.current = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance to spawn plant
        const newPlant = generatePlant();
        setMoles(prev => [...prev, newPlant]);

        // Remove plant after some time
        setTimeout(() => {
          setMoles(prev => prev.filter(m => m.id !== newPlant.id));
        }, plantSpeed);
      }
    }, plantSpeed);
  }, [gameState.currentLevel, generatePlant]);

  // Start difficulty progression
  const startDifficultyProgression = useCallback(() => {
    difficultyIntervalRef.current = setInterval(() => {
      setGameState(prev => {
        const nextLevelConfig = GAME_CONFIG.LEVEL_CONFIG[prev.currentLevel];
        if (nextLevelConfig && prev.score >= nextLevelConfig.pointsRequired) {
          playSound('levelup-sound');
          return {
            ...prev,
            currentLevel: prev.currentLevel + 1,
            pointsToNextLevel: nextLevelConfig.pointsRequired
          };
        }
        return prev;
      });
    }, 5000); // Check every 5 seconds
  }, [playSound]);

  // Handle mole click
  const handleMoleClick = useCallback((position: number) => {
    if (gameState.gameOver || gameState.isPaused) return;

    const clickedMole = moles.find(m => m.position === position && m.isVisible);
    if (!clickedMole) return;

    // Remove the clicked mole
    setMoles(prev => prev.filter(m => m.id !== clickedMole.id));

    if (clickedMole.type === 'plant') {
      // Hit plant - game over
      playSound('gameover-sound');
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        isPlaying: false,
        plantsHit: prev.plantsHit + 1
      }));
      return;
    }

    // Hit mole - add score
    playSound('hit-sound');
    const currentLevelConfig = GAME_CONFIG.LEVEL_CONFIG[gameState.currentLevel - 1];
    const multiplier = currentLevelConfig?.multiplier || 1;
    const points = Math.round(clickedMole.points * multiplier);

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      molesHit: prev.molesHit + 1
    }));
  }, [gameState.gameOver, gameState.isPaused, gameState.currentLevel, moles, playSound]);

  // Start game
  const startGame = useCallback(async () => {
    setGameState({
      score: 0,
      timeLeft: GAME_CONFIG.DURATION,
      currentLevel: 1,
      pointsToNextLevel: GAME_CONFIG.LEVEL_CONFIG[0].pointsRequired,
      gameOver: false,
      isPaused: false,
      molesHit: 0,
      plantsHit: 0,
      isPlaying: true
    });

    setMoles([]);
    
    // Start all intervals
    startGameTimer();
    startMoleSpawning();
    startPlantSpawning();
    startDifficultyProgression();
    
    // Start background music
    playBackgroundMusic();
  }, [startGameTimer, startMoleSpawning, startPlantSpawning, startDifficultyProgression, playBackgroundMusic]);

  // Pause game
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
    clearAllIntervals();
    pauseBackgroundMusic();
  }, [clearAllIntervals, pauseBackgroundMusic]);

  // Resume game
  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
    startGameTimer();
    startMoleSpawning();
    startPlantSpawning();
    startDifficultyProgression();
    playBackgroundMusic();
  }, [startGameTimer, startMoleSpawning, startPlantSpawning, startDifficultyProgression, playBackgroundMusic]);

  // Stop game
  const stopGame = useCallback(async () => {
    clearAllIntervals();
    pauseBackgroundMusic();
    
    // Update game statistics
    const timePlayed = GAME_CONFIG.DURATION - gameState.timeLeft;
    const newStats = {
      ...gameStats,
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalScore: gameStats.totalScore + gameState.score,
      totalCoins: gameStats.totalCoins + gameState.score,
      bestTime: Math.max(gameStats.bestTime, timePlayed),
      highestLevel: Math.max(gameStats.highestLevel, gameState.currentLevel),
      molesHit: gameStats.molesHit + gameState.molesHit,
      plantsHit: gameStats.plantsHit + gameState.plantsHit,
      averageScore: Math.round((gameStats.totalScore + gameState.score) / (gameStats.gamesPlayed + 1))
    };

    setGameStats(newStats);
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(newStats));

    setGameState(prev => ({ ...prev, gameOver: true, isPlaying: false }));
    setMoles([]);
  }, [clearAllIntervals, pauseBackgroundMusic, gameState, gameStats]);

  // Reset game
  const resetGame = useCallback(() => {
    clearAllIntervals();
    pauseBackgroundMusic();
    
    setGameState({
      score: 0,
      timeLeft: GAME_CONFIG.DURATION,
      currentLevel: 1,
      pointsToNextLevel: GAME_CONFIG.LEVEL_CONFIG[0].pointsRequired,
      gameOver: true,
      isPaused: false,
      molesHit: 0,
      plantsHit: 0,
      isPlaying: false
    });
    
    setMoles([]);
  }, [clearAllIntervals, pauseBackgroundMusic]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(updated));
  }, [settings]);

  // Auto-stop game when time runs out
  useEffect(() => {
    if (gameState.timeLeft === 0 && gameState.isPlaying) {
      stopGame();
    }
  }, [gameState.timeLeft, gameState.isPlaying, stopGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllIntervals();
      pauseBackgroundMusic();
    };
  }, [clearAllIntervals, pauseBackgroundMusic]);

  return {
    gameState,
    gameStats,
    moles,
    startGame,
    pauseGame,
    resumeGame,
    stopGame,
    handleMoleClick,
    resetGame,
    settings,
    updateSettings
  };
};
