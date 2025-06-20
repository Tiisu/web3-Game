// Achievements list component

import React from 'react';
import { AchievementsProps } from '../types';
import { ACHIEVEMENT_DATA } from '../config/web3Config';
import '../styles/AchievementsList.css';

const AchievementsList: React.FC<AchievementsProps> = ({ 
  achievements, 
  playerData, 
  isLoading 
}) => {
  const achievementTypes = ['BEGINNER', 'PRO', 'MASTER', 'REGULAR', 'VETERAN'] as const;

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

  return (
    <div className="achievements">
      <h3>NFT Achievements 🏆</h3>
      
      {isLoading && (
        <div className="achievements-loading">
          <div className="loading-spinner"></div>
          <span>Loading achievements...</span>
        </div>
      )}
      
      <div className="achievements-list">
        {achievementTypes.map(type => {
          const isUnlocked = achievements.includes(type);
          const achievementInfo = ACHIEVEMENT_DATA[type];
          const progress = getAchievementProgress(type);
          
          return (
            <div 
              key={type}
              className={`achievement ${isUnlocked ? 'unlocked' : 'locked'}`}
              data-achievement={type}
            >
              <div className="achievement-icon">
                {achievementInfo.icon}
              </div>
              
              <div className="achievement-content">
                <div className="achievement-header">
                  <span className="achievement-name">
                    {achievementInfo.name}
                  </span>
                  {isUnlocked && (
                    <span className="nft-badge">NFT</span>
                  )}
                </div>
                
                <div className="achievement-description">
                  {achievementInfo.description}
                </div>
                
                {!isUnlocked && playerData && (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {progress.progress.toLocaleString()} / {progress.target.toLocaleString()}
                    </div>
                  </div>
                )}
                
                <div className="achievement-rarity">
                  <span className={`rarity-badge ${achievementInfo.rarity.toLowerCase()}`}>
                    {achievementInfo.rarity}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {!playerData && (
        <div className="achievements-placeholder">
          <p>Connect your wallet to view NFT achievements!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsList;
