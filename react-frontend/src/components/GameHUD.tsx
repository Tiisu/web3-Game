// Enhanced Game HUD (Heads-Up Display) component with modern gaming UI patterns

import React, { useEffect, useState } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/GameHUD.css';

const GameHUD: React.FC = () => {
  const { gameState, gameStats } = useGameContext();
  const { web3State } = useWeb3();
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [timerPulse, setTimerPulse] = useState(false);
  const [lastScore, setLastScore] = useState(gameState.score);

  // Animate score changes
  useEffect(() => {
    if (gameState.score !== lastScore) {
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 500);
      setLastScore(gameState.score);
    }
  }, [gameState.score, lastScore]);

  // Timer warning effects
  useEffect(() => {
    if (gameState.timeLeft <= 10 && gameState.isPlaying) {
      setTimerPulse(true);
    } else {
      setTimerPulse(false);
    }
  }, [gameState.timeLeft, gameState.isPlaying]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer progress percentage
  const getTimerProgress = () => {
    return (gameState.timeLeft / 60) * 100;
  };

  // Get score progress towards best
  const getScoreProgress = () => {
    const bestScore = web3State.playerData?.highestScore || 1000;
    return Math.min((gameState.score / bestScore) * 100, 100);
  };

  return (
    <div className="game-hud">
      {/* Main Score Display */}
      <div className={`hud-score ${scoreAnimation ? 'score-animate' : ''} ${gameState.currentStreak >= 5 ? 'combo-mode' : ''}`}>
        <div className="score-container">
          <div className="score-icon">🎯</div>
          <div className="score-content">
            <div className="score-value">
              {gameState.score.toLocaleString()}
              {gameState.currentStreak >= 5 && <span className="combo-indicator">🔥</span>}
            </div>
            <div className="score-label">Score</div>
          </div>
          <div className="score-progress">
            <div 
              className="progress-fill"
              style={{ width: `${getScoreProgress()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Score change indicator */}
        {scoreAnimation && (
          <div className="score-change">
            +{gameState.score - lastScore}
          </div>
        )}
      </div>

      {/* Enhanced Timer Display */}
      <div className={`hud-timer ${timerPulse ? 'timer-warning' : ''} ${gameState.isPlaying ? 'active' : ''}`}>
        <div className="timer-container">
          <div className="timer-icon">⏱️</div>
          <div className="timer-content">
            <div className="timer-value">
              {formatTime(gameState.timeLeft)}
            </div>
            <div className="timer-label">Time</div>
          </div>
          
          {/* Circular timer progress */}
          <div className="timer-circle">
            <svg className="timer-svg" viewBox="0 0 100 100">
              <circle
                className="timer-track"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="8"
              />
              <circle
                className="timer-progress"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={timerPulse ? "#e74c3c" : "#4CAF50"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${getTimerProgress() * 2.83}, 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>
        
        {/* Timer warning indicator */}
        {timerPulse && (
          <div className="timer-warning-indicator">
            <span className="warning-text">⚠️ TIME!</span>
          </div>
        )}
      </div>

      {/* Level and Streak Display */}
      <div className="hud-secondary">
        <div className="hud-level">
          <div className="level-icon">📊</div>
          <div className="level-content">
            <div className="level-value">LVL {gameState.currentLevel}</div>
            <div className="level-progress">
              <div 
                className="level-fill"
                style={{ 
                  width: `${Math.min((gameState.score / gameState.pointsToNextLevel) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`hud-streak ${gameState.currentStreak >= 5 ? 'streak-fire' : ''}`}>
          <div className="streak-icon">
            {gameState.currentStreak >= 10 ? '⚡' : gameState.currentStreak >= 5 ? '🔥' : '🎯'}
          </div>
          <div className="streak-content">
            <div className="streak-value">{gameState.currentStreak}</div>
            <div className="streak-label">Streak</div>
          </div>
          
          {/* Streak indicators */}
          <div className="streak-dots">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`streak-dot ${i < gameState.currentStreak ? 'active' : ''}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Game State Indicators */}
      {gameState.isPaused && (
        <div className="hud-overlay paused">
          <div className="overlay-content">
            <div className="overlay-icon">⏸️</div>
            <div className="overlay-text">PAUSED</div>
          </div>
        </div>
      )}

      {!gameState.isPlaying && !gameState.isPaused && (
        <div className="hud-overlay ready">
          <div className="overlay-content">
            <div className="overlay-icon">🎮</div>
            <div className="overlay-text">READY</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHUD;
