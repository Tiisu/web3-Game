// Enhanced NFT Achievements Component

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Crown, Target, Zap, Lock, Unlock, Award, Sparkles } from 'lucide-react';
import { AchievementsProps } from '../types';
import { ACHIEVEMENT_DATA } from '../config/web3Config';
import '../styles/AchievementsList.css';

const AchievementsList: React.FC<AchievementsProps> = ({ 
  achievements, 
  playerData, 
  isLoading 
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const achievementTypes = ['BEGINNER', 'PRO', 'MASTER', 'REGULAR', 'VETERAN'] as const;

  // Enhanced achievement data with better icons and descriptions
  const enhancedAchievementData = {
    BEGINNER: {
      name: 'First Steps',
      description: 'Score 1,000+ points in a single game',
      icon: <Target className="w-6 h-6" />,
      rarity: 'Common',
      color: '#10b981',
      bgGradient: 'from-green-500/20 to-emerald-600/20',
      requirement: 'Score: 1,000 points',
      reward: 'Beginner NFT Badge'
    },
    PRO: {
      name: 'Pro Player',
      description: 'Score 5,000+ points in a single game',
      icon: <Star className="w-6 h-6" />,
      rarity: 'Rare',
      color: '#3b82f6',
      bgGradient: 'from-blue-500/20 to-indigo-600/20',
      requirement: 'Score: 5,000 points',
      reward: 'Pro NFT Badge'
    },
    MASTER: {
      name: 'Master',
      description: 'Score 10,000+ points in a single game',
      icon: <Crown className="w-6 h-6" />,
      rarity: 'Epic',
      color: '#8b5cf6',
      bgGradient: 'from-purple-500/20 to-violet-600/20',
      requirement: 'Score: 10,000 points',
      reward: 'Master NFT Badge'
    },
    REGULAR: {
      name: 'Regular Player',
      description: 'Play 10 or more games',
      icon: <Zap className="w-6 h-6" />,
      rarity: 'Uncommon',
      color: '#f59e0b',
      bgGradient: 'from-amber-500/20 to-orange-600/20',
      requirement: 'Games: 10 played',
      reward: 'Regular NFT Badge'
    },
    VETERAN: {
      name: 'Veteran',
      description: 'Play 100 or more games',
      icon: <Award className="w-6 h-6" />,
      rarity: 'Legendary',
      color: '#ef4444',
      bgGradient: 'from-red-500/20 to-rose-600/20',
      requirement: 'Games: 100 played',
      reward: 'Veteran NFT Badge'
    }
  };

  const getAchievementProgress = (type: string) => {
    if (!playerData) return { progress: 0, target: 1, percentage: 0 };

    switch (type) {
      case 'BEGINNER':
        return {
          progress: Math.min(playerData.highestScore, 1000),
          target: 1000,
          percentage: Math.min((playerData.highestScore / 1000) * 100, 100)
        };
      case 'PRO':
        return {
          progress: Math.min(playerData.highestScore, 5000),
          target: 5000,
          percentage: Math.min((playerData.highestScore / 5000) * 100, 100)
        };
      case 'MASTER':
        return {
          progress: Math.min(playerData.highestScore, 10000),
          target: 10000,
          percentage: Math.min((playerData.highestScore / 10000) * 100, 100)
        };
      case 'REGULAR':
        return {
          progress: Math.min(playerData.totalGamesPlayed, 10),
          target: 10,
          percentage: Math.min((playerData.totalGamesPlayed / 10) * 100, 100)
        };
      case 'VETERAN':
        return {
          progress: Math.min(playerData.totalGamesPlayed, 100),
          target: 100,
          percentage: Math.min((playerData.totalGamesPlayed / 100) * 100, 100)
        };
      default:
        return { progress: 0, target: 1, percentage: 0 };
    }
  };

  const unlockedCount = achievements.length;
  const totalCount = achievementTypes.length;

  return (
    <div className="achievements-section">
      {/* Header */}
      <div className="achievements-header">
        <div className="header-content">
          <div className="header-title">
            <Trophy className="w-6 h-6 text-gaming-accent" />
            <h3>NFT Achievements</h3>
            <div className="achievement-count">
              <span className="count-badge">
                {unlockedCount}/{totalCount}
              </span>
            </div>
          </div>
          <div className="header-subtitle">
            Collect exclusive NFT badges by completing challenges
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <motion.div 
          className="achievements-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <span>Loading NFT achievements...</span>
          </div>
        </motion.div>
      )}

      {/* Achievements Grid/List */}
      <div className={`achievements-container ${viewMode}`}>
        <AnimatePresence>
          {achievementTypes.map((type, index) => {
            const isUnlocked = achievements.includes(type);
            const achievementInfo = enhancedAchievementData[type];
            const progress = getAchievementProgress(type);
            
            return (
              <motion.div
                key={type}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setSelectedAchievement(selectedAchievement === type ? null : type)}
              >
                {/* Unlock Effect */}
                {isUnlocked && (
                  <motion.div
                    className="unlock-effect"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                )}

                {/* Rarity Border */}
                <div className={`rarity-border rarity-${achievementInfo.rarity.toLowerCase()}`} />

                {/* Card Content */}
                <div className="card-content">
                  {/* Icon Section */}
                  <div className={`achievement-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                    <div className="icon-container" style={{ color: achievementInfo.color }}>
                      {achievementInfo.icon}
                    </div>
                    {isUnlocked ? (
                      <Unlock className="w-4 h-4 unlock-indicator" />
                    ) : (
                      <Lock className="w-4 h-4 lock-indicator" />
                    )}
                  </div>

                  {/* Achievement Info */}
                  <div className="achievement-info">
                    <div className="achievement-header">
                      <h4 className="achievement-name">{achievementInfo.name}</h4>
                      <div className="achievement-badges">
                        <span className={`rarity-badge rarity-${achievementInfo.rarity.toLowerCase()}`}>
                          {achievementInfo.rarity}
                        </span>
                        {isUnlocked && (
                          <motion.span 
                            className="nft-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            NFT
                          </motion.span>
                        )}
                      </div>
                    </div>

                    <p className="achievement-description">
                      {achievementInfo.description}
                    </p>

                    {/* Progress Bar for Locked Achievements */}
                    {!isUnlocked && playerData && (
                      <div className="progress-section">
                        <div className="progress-header">
                          <span className="progress-label">Progress</span>
                          <span className="progress-percentage">{Math.round(progress.percentage)}%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            style={{ backgroundColor: achievementInfo.color }}
                          />
                        </div>
                        <div className="progress-text">
                          {progress.progress.toLocaleString()} / {progress.target.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Unlock Status */}
                    {isUnlocked && (
                      <motion.div 
                        className="unlock-status"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="unlock-icon">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <span>Achievement Unlocked!</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedAchievement === type && (
                    <motion.div
                      className="achievement-details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="details-content">
                        <div className="detail-item">
                          <span className="detail-label">Requirement:</span>
                          <span className="detail-value">{achievementInfo.requirement}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Reward:</span>
                          <span className="detail-value">{achievementInfo.reward}</span>
                        </div>
                        {isUnlocked && (
                          <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value unlocked">NFT Minted</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!playerData && (
        <motion.div 
          className="achievements-placeholder"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="placeholder-content">
            <Trophy className="w-12 h-12 text-gaming-accent opacity-50" />
            <h4>Connect Your Wallet</h4>
            <p>Connect your wallet to view and earn NFT achievements!</p>
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      {playerData && (
        <motion.div 
          className="achievements-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="summary-item">
            <span className="summary-label">Achievements Unlocked</span>
            <span className="summary-value">{unlockedCount} / {totalCount}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">NFTs Collected</span>
            <span className="summary-value">{unlockedCount}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Completion Rate</span>
            <span className="summary-value">{Math.round((unlockedCount / totalCount) * 100)}%</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AchievementsList;