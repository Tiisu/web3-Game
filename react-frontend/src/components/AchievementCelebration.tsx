// Achievement Celebration Component
// Game-themed celebrations for NFT achievements and leaderboard updates

import React, { useState, useEffect } from 'react';
import '../styles/AchievementCelebration.css';

interface AchievementCelebrationProps {
  type: 'achievement' | 'leaderboard' | 'milestone';
  isVisible: boolean;
  onComplete: () => void;
  data: {
    title: string;
    description: string;
    icon?: string;
    score?: number;
    position?: number;
    achievement?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  type,
  isVisible,
  onComplete,
  data
}) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('enter');
      
      // Enter phase
      const enterTimer = setTimeout(() => {
        setAnimationPhase('celebrate');
      }, 500);

      // Celebration phase
      const celebrateTimer = setTimeout(() => {
        setAnimationPhase('exit');
      }, 3000);

      // Exit phase
      const exitTimer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(celebrateTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getCelebrationClass = () => {
    let baseClass = `achievement-celebration ${type} ${animationPhase}`;
    if (data.rarity) {
      baseClass += ` rarity-${data.rarity}`;
    }
    return baseClass;
  };

  const getParticleCount = () => {
    switch (type) {
      case 'achievement':
        return data.rarity === 'legendary' ? 30 : data.rarity === 'epic' ? 20 : 15;
      case 'leaderboard':
        return 25;
      case 'milestone':
        return 20;
      default:
        return 15;
    }
  };

  const getParticleEmojis = () => {
    switch (type) {
      case 'achievement':
        return ['🏆', '⭐', '✨', '🎉', '🎊', '💎'];
      case 'leaderboard':
        return ['📈', '🚀', '⭐', '🏅', '👑', '🎯'];
      case 'milestone':
        return ['🎯', '🎉', '✨', '🌟', '💫', '🎊'];
      default:
        return ['🎉', '✨', '⭐'];
    }
  };

  return (
    <div className={getCelebrationClass()}>
      {/* Particle System */}
      <div className="celebration-particles">
        {Array.from({ length: getParticleCount() }).map((_, index) => {
          const emoji = getParticleEmojis()[index % getParticleEmojis().length];
          return (
            <div
              key={index}
              className={`celebration-particle particle-${index % 6}`}
              style={{
                animationDelay: `${(index * 0.1)}s`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {emoji}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="celebration-content">
        {/* Icon/Badge */}
        <div className="celebration-icon">
          {type === 'achievement' && (
            <div className="achievement-badge">
              <div className="badge-glow"></div>
              <div className="badge-content">
                {data.icon || '🏆'}
              </div>
              {data.rarity && (
                <div className={`rarity-indicator ${data.rarity}`}>
                  {data.rarity.toUpperCase()}
                </div>
              )}
            </div>
          )}
          
          {type === 'leaderboard' && (
            <div className="leaderboard-badge">
              <div className="position-crown">👑</div>
              <div className="position-number">#{data.position}</div>
            </div>
          )}
          
          {type === 'milestone' && (
            <div className="milestone-badge">
              <div className="milestone-icon">🎯</div>
              <div className="milestone-score">{data.score?.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="celebration-text">
          <h2 className="celebration-title">{data.title}</h2>
          <p className="celebration-description">{data.description}</p>
          
          {type === 'achievement' && data.achievement && (
            <div className="achievement-name">"{data.achievement}"</div>
          )}
          
          {type === 'leaderboard' && data.score && (
            <div className="leaderboard-score">
              {data.score.toLocaleString()} points
            </div>
          )}
        </div>

        {/* Special Effects */}
        {type === 'achievement' && data.rarity === 'legendary' && (
          <div className="legendary-effects">
            <div className="legendary-beam beam-1"></div>
            <div className="legendary-beam beam-2"></div>
            <div className="legendary-beam beam-3"></div>
            <div className="legendary-beam beam-4"></div>
          </div>
        )}

        {type === 'leaderboard' && data.position && data.position <= 3 && (
          <div className="podium-effects">
            <div className="podium-light"></div>
            <div className="podium-sparkles">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`sparkle sparkle-${i}`}>✨</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background Effects */}
      <div className="celebration-background">
        <div className="bg-pulse"></div>
        <div className="bg-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing achievement celebrations
export const useAchievementCelebration = () => {
  const [celebration, setCelebration] = useState<{
    type: 'achievement' | 'leaderboard' | 'milestone';
    data: any;
    isVisible: boolean;
  } | null>(null);

  const showAchievementUnlock = (achievement: string, rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common') => {
    setCelebration({
      type: 'achievement',
      isVisible: true,
      data: {
        title: 'Achievement Unlocked! 🏆',
        description: 'You\'ve earned a new NFT achievement!',
        achievement,
        rarity,
        icon: '🏆'
      }
    });
  };

  const showLeaderboardUpdate = (position: number, score: number) => {
    setCelebration({
      type: 'leaderboard',
      isVisible: true,
      data: {
        title: 'Leaderboard Updated! 📋',
        description: `You've climbed the ranks!`,
        position,
        score,
        icon: '📈'
      }
    });
  };

  const showMilestone = (score: number, milestone: string) => {
    setCelebration({
      type: 'milestone',
      isVisible: true,
      data: {
        title: 'Milestone Reached! 🎯',
        description: milestone,
        score,
        icon: '🎯'
      }
    });
  };

  const hideCelebration = () => {
    setCelebration(null);
  };

  return {
    celebration,
    showAchievementUnlock,
    showLeaderboardUpdate,
    showMilestone,
    hideCelebration
  };
};

export default AchievementCelebration;
