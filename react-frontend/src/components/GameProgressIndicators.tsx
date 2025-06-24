// Enhanced Game Progress Indicators and Achievement System

import React, { useEffect, useState } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/GameProgressIndicators.css';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (gameState: any, gameStats: any) => boolean;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const GameProgressIndicators: React.FC = () => {
  const { gameState, gameStats } = useGameContext();
  const { web3State } = useWeb3();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [levelProgress, setLevelProgress] = useState(0);
  const [experienceGained, setExperienceGained] = useState(0);

  // Define achievements
  const achievementDefinitions: Omit<Achievement, 'unlocked' | 'progress'>[] = [
    {
      id: 'first-hit',
      title: 'First Strike',
      description: 'Hit your first mole',
      icon: '🎯',
      condition: (gs) => gs.score > 0,
      maxProgress: 1
    },
    {
      id: 'combo-master',
      title: 'Combo Master',
      description: 'Achieve a 5-hit combo',
      icon: '🔥',
      condition: (gs) => gs.currentStreak >= 5,
      maxProgress: 5
    },
    {
      id: 'legendary-streak',
      title: 'Legendary Streak',
      description: 'Achieve a 10-hit combo',
      icon: '⚡',
      condition: (gs) => gs.currentStreak >= 10,
      maxProgress: 10
    },
    {
      id: 'score-hunter',
      title: 'Score Hunter',
      description: 'Reach 1000 points',
      icon: '💰',
      condition: (gs) => gs.score >= 1000,
      maxProgress: 1000
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Hit 20 moles in one game',
      icon: '💨',
      condition: (gs, gst) => gst.totalHits >= 20,
      maxProgress: 20
    },
    {
      id: 'golden-touch',
      title: 'Golden Touch',
      description: 'Hit 3 golden moles',
      icon: '✨',
      condition: (gs, gst) => gst.goldenMolesHit >= 3,
      maxProgress: 3
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Achieve 90% accuracy',
      icon: '🏆',
      condition: (gs, gst) => gst.totalHits > 0 && (gst.totalHits / (gst.totalHits + gst.totalMisses)) >= 0.9,
      maxProgress: 90
    },
    {
      id: 'web3-warrior',
      title: 'Web3 Warrior',
      description: 'Complete 5 blockchain transactions',
      icon: '⛓️',
      condition: (gs, gst) => gst.blockchainTransactions >= 5,
      maxProgress: 5
    }
  ];

  // Initialize achievements
  useEffect(() => {
    const initialAchievements = achievementDefinitions.map(def => ({
      ...def,
      unlocked: false,
      progress: 0
    }));
    setAchievements(initialAchievements);
  }, []);

  // Check for achievement unlocks
  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      const isUnlocked = achievement.condition(gameState, gameStats);
      const progress = calculateProgress(achievement, gameState, gameStats);
      
      // Check if this is a newly unlocked achievement
      if (isUnlocked && !achievement.unlocked) {
        setNewAchievements(prev => [...prev, { ...achievement, unlocked: true, progress }]);
        // Remove from new achievements after 3 seconds
        setTimeout(() => {
          setNewAchievements(prev => prev.filter(a => a.id !== achievement.id));
        }, 3000);
      }
      
      return {
        ...achievement,
        unlocked: isUnlocked,
        progress
      };
    });
    
    setAchievements(updatedAchievements);
  }, [gameState, gameStats]);

  // Calculate progress for achievements
  const calculateProgress = (achievement: Achievement, gs: any, gst: any): number => {
    switch (achievement.id) {
      case 'first-hit':
        return Math.min(gs.score > 0 ? 1 : 0, 1);
      case 'combo-master':
        return Math.min(gs.currentStreak, 5);
      case 'legendary-streak':
        return Math.min(gs.currentStreak, 10);
      case 'score-hunter':
        return Math.min(gs.score, 1000);
      case 'speed-demon':
        return Math.min(gst.totalHits || 0, 20);
      case 'golden-touch':
        return Math.min(gst.goldenMolesHit || 0, 3);
      case 'perfectionist':
        const accuracy = gst.totalHits > 0 ? (gst.totalHits / (gst.totalHits + gst.totalMisses)) * 100 : 0;
        return Math.min(accuracy, 90);
      case 'web3-warrior':
        return Math.min(gst.blockchainTransactions || 0, 5);
      default:
        return 0;
    }
  };

  // Calculate level progress
  useEffect(() => {
    const progress = Math.min((gameState.score / gameState.pointsToNextLevel) * 100, 100);
    setLevelProgress(progress);
  }, [gameState.score, gameState.pointsToNextLevel]);

  // Calculate experience gained
  useEffect(() => {
    const baseExp = gameState.score * 0.1;
    const comboBonus = gameState.currentStreak * 5;
    const levelBonus = gameState.currentLevel * 10;
    setExperienceGained(Math.floor(baseExp + comboBonus + levelBonus));
  }, [gameState.score, gameState.currentStreak, gameState.currentLevel]);

  return (
    <div className="game-progress-indicators">
      {/* Level Progress Bar */}
      <div className="level-progress-container">
        <div className="level-info">
          <div className="level-badge">
            <span className="level-number">{gameState.currentLevel}</span>
            <span className="level-label">LVL</span>
          </div>
          <div className="level-details">
            <div className="level-title">Level {gameState.currentLevel}</div>
            <div className="level-subtitle">
              {gameState.currentLevel < 5 ? 
                `${gameState.score} / ${gameState.pointsToNextLevel} XP` : 
                'Max Level!'
              }
            </div>
          </div>
        </div>
        
        <div className="level-progress-bar">
          <div 
            className="level-progress-fill"
            style={{ width: `${levelProgress}%` }}
          >
            <div className="progress-shine"></div>
          </div>
          <div className="progress-particles">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="progress-particle"
                style={{ '--delay': `${i * 0.2}s` } as React.CSSProperties}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Indicator */}
      {experienceGained > 0 && gameState.isPlaying && (
        <div className="experience-indicator">
          <div className="exp-icon">⭐</div>
          <div className="exp-value">+{experienceGained} XP</div>
        </div>
      )}

      {/* Achievement Notifications */}
      {newAchievements.map(achievement => (
        <div key={achievement.id} className="achievement-notification">
          <div className="achievement-content">
            <div className="achievement-header">
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-badge">Achievement Unlocked!</div>
            </div>
            <div className="achievement-details">
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-description">{achievement.description}</div>
            </div>
          </div>
          <div className="achievement-glow"></div>
        </div>
      ))}

      {/* Achievement Progress Sidebar */}
      <div className="achievement-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-icon">🏆</div>
          <div className="sidebar-title">Achievements</div>
          <div className="sidebar-count">
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </div>
        </div>
        
        <div className="achievement-list">
          {achievements.slice(0, 4).map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-item-icon">{achievement.icon}</div>
              <div className="achievement-item-info">
                <div className="achievement-item-title">{achievement.title}</div>
                <div className="achievement-progress-mini">
                  <div 
                    className="progress-mini-fill"
                    style={{ 
                      width: `${achievement.maxProgress ? (achievement.progress! / achievement.maxProgress) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game State Transitions */}
      {gameState.isPlaying && gameState.currentStreak >= 5 && (
        <div className="game-state-enhancement combo-mode">
          <div className="enhancement-particles">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="enhancement-particle"
                style={{ 
                  '--angle': `${i * 36}deg`,
                  '--delay': `${i * 0.1}s`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>
        </div>
      )}

      {gameState.timeLeft <= 10 && gameState.isPlaying && (
        <div className="game-state-enhancement time-critical">
          <div className="critical-vignette"></div>
        </div>
      )}
    </div>
  );
};

export default GameProgressIndicators;
