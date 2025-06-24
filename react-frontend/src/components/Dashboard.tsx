// Dashboard component with stats, achievements, and leaderboard

import React, { useEffect, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import AchievementsList from './AchievementsList';
import Leaderboard from './Leaderboard';
<<<<<<< HEAD
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { web3State, refreshData, isLoading } = useWeb3();
  const { gameStats } = useGameContext();
=======
import Web3DataDebug from './Web3DataDebug';
import '../styles/Dashboard.css';
import '../styles/Web3DataDebug.css';

const Dashboard: React.FC = () => {
  const { web3State, refreshData, isLoading } = useWeb3();
  const { gameStats, gameState } = useGameContext();
>>>>>>> master
  const lastRefreshRef = useRef<number>(0);

  const handleRefresh = async () => {
    await refreshData();
  };

  // Auto-refresh dashboard when Web3 state changes (but not too frequently)
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;

    // Only auto-refresh if it's been at least 2 seconds since last refresh
    // and we have connected account with player data
    if (web3State.isConnected &&
        web3State.account &&
        web3State.playerData?.isRegistered &&
        timeSinceLastRefresh > 2000) {

      console.log('🔄 Dashboard auto-refreshing due to Web3 state change...');
      lastRefreshRef.current = now;
      refreshData();
    }
  }, [web3State.playerData?.totalGamesPlayed, web3State.playerData?.totalScore, web3State.playerData?.highestScore, web3State.achievements.length, web3State.leaderboard.length, refreshData, web3State.isConnected, web3State.account]);

  // Use Web3 data if available, otherwise fall back to local stats
  const displayStats = web3State.playerData ? {
<<<<<<< HEAD
    gamesPlayed: web3State.playerData.totalGamesPlayed,
    totalScore: web3State.playerData.totalScore,
    highestScore: web3State.playerData.highestScore,
    averageScore: web3State.playerData.totalGamesPlayed > 0 ? 
      Math.round(web3State.playerData.totalScore / web3State.playerData.totalGamesPlayed) : 0,
    molesHit: web3State.playerData.totalMolesHit,
    nftCount: web3State.achievements.length
  } : {
    gamesPlayed: gameStats.gamesPlayed,
    totalScore: gameStats.totalScore,
    highestScore: gameStats.highestLevel,
    averageScore: gameStats.averageScore,
    molesHit: gameStats.molesHit,
    nftCount: 0
=======
    gamesPlayed: web3State.playerData.totalGamesPlayed || 0,
    totalScore: web3State.playerData.totalScore || 0,
    highestScore: web3State.playerData.highestScore || 0,
    averageScore: web3State.playerData.totalGamesPlayed > 0 ? 
      Math.round(web3State.playerData.totalScore / web3State.playerData.totalGamesPlayed) : 0,
    molesHit: web3State.playerData.totalMolesHit || 0,
    nftCount: web3State.achievements.length || 0,
    isWeb3Data: true
  } : {
    gamesPlayed: gameStats.gamesPlayed || 0,
    totalScore: gameStats.totalScore || 0,
    highestScore: gameStats.highestLevel || 0,
    averageScore: gameStats.averageScore || 0,
    molesHit: gameStats.molesHit || 0,
    nftCount: 0,
    isWeb3Data: false
  };

  // Calculate additional stats
  const additionalStats = {
    winRate: displayStats.gamesPlayed > 0 ? 
      Math.round((displayStats.gamesPlayed / Math.max(displayStats.gamesPlayed, 1)) * 100) : 0,
    accuracy: displayStats.molesHit > 0 ? 
      Math.round((displayStats.molesHit / Math.max(displayStats.molesHit + (gameStats.plantsHit || 0), 1)) * 100) : 0,
    registrationDate: web3State.playerData?.registrationTime ? 
      web3State.playerData.registrationTime.toLocaleDateString() : null
>>>>>>> master
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="dashboard-header">
<<<<<<< HEAD
          <h2>Player Stats</h2>
          {web3State.isConnected && (
            <button 
=======
          <h2>Game Dashboard</h2>
          {web3State.isConnected && (
            <button
>>>>>>> master
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh blockchain data"
            >
              🔄
            </button>
          )}
        </div>

<<<<<<< HEAD
=======
        {/* Enhanced Current Game Stats Section */}
        <div className="current-game-section">
          <h3>🎮 Current Game</h3>
          <div className="current-game-stats">
            <div className="current-stat score">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-label">Score</span>
                <span className="stat-value">{gameState.score?.toLocaleString() || 0}</span>
              </div>
            </div>
            <div className="current-stat level">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <span className="stat-label">Level</span>
                <span className="stat-value">{gameState.currentLevel || 1}</span>
              </div>
            </div>
            <div className="current-stat streak">
              <div className="stat-icon">{gameState.currentStreak >= 5 ? '🔥' : '🎪'}</div>
              <div className="stat-content">
                <span className="stat-label">Streak</span>
                <span className="stat-value">{gameState.currentStreak || 0}</span>
              </div>
            </div>
            <div className="current-stat time">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <span className="stat-label">Time Left</span>
                <span className={`stat-value time-display ${gameState.timeLeft <= 10 && gameState.isPlaying ? 'warning' : ''}`}>
                  {gameState.timeLeft ? `${Math.floor(gameState.timeLeft / 60)}:${(gameState.timeLeft % 60).toString().padStart(2, '0')}` : '2:00'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Game Status Indicator */}
          <div className="game-status-indicator">
            <div className={`status-badge ${gameState.isPlaying ? 'playing' : gameState.isPaused ? 'paused' : 'stopped'}`}>
              {gameState.isPlaying ? '🎮 Playing' : gameState.isPaused ? '⏸️ Paused' : '⏹️ Stopped'}
            </div>
          </div>
        </div>

        {/* Player Profile Section */}
        <div className="player-profile-section">
          <h3>Player Profile</h3>

>>>>>>> master
        {/* Web3 Player Info */}
        {web3State.playerData && web3State.playerData.isRegistered && (
          <div className="web3-player-info">
            <div className="player-header">
              <span className="player-username">
                {web3State.playerData.username}
              </span>
              <button 
                className="edit-btn"
                title="Edit username"
                onClick={() => {
                  const newUsername = prompt('Enter new username:');
                  if (newUsername && newUsername.trim()) {
                    // TODO: Implement username update
                    console.log('Update username to:', newUsername);
                  }
                }}
              >
                ✏️
              </button>
            </div>
            <div className="player-rank">
              <span>Rank: #</span>
              <span className="rank-value">-</span>
            </div>
          </div>
        )}
<<<<<<< HEAD

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Games Played</div>
            <div className="stat-value">{displayStats.gamesPlayed}</div>
            <div className={`stat-source ${web3State.playerData ? 'blockchain' : 'local'}`}>
              {web3State.playerData ? 'On-Chain' : 'Local'}
=======
        </div>

        {/* Overall Stats Section */}
        <div className="overall-stats-section">
          <div className="section-header">
            <h3>Overall Statistics</h3>
            <div className="data-source-indicator">
              {displayStats.isWeb3Data ? (
                <div className="data-source blockchain">
                  <span className="source-icon">🔗</span>
                  <span>Blockchain Data</span>
                </div>
              ) : (
                <div className="data-source local">
                  <span className="source-icon">💻</span>
                  <span>Local Data</span>
                </div>
              )}
            </div>
          </div>

        {/* Data Loading Indicator */}
        {isLoading && (
          <div className="data-loading-indicator">
            <div className="loading-spinner"></div>
            <span>Refreshing blockchain data...</span>
          </div>
        )}

        {/* Enhanced Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item highlight">
            <div className="stat-icon">🎮</div>
            <div className="stat-content">
              <div className="stat-label">Games Played</div>
              <div className="stat-value">{displayStats.gamesPlayed.toLocaleString()}</div>
              <div className={`stat-source ${displayStats.isWeb3Data ? 'blockchain' : 'local'}`}>
                {displayStats.isWeb3Data ? '🔗 On-Chain' : '💻 Local'}
              </div>
            </div>
          </div>

          <div className="stat-item highlight">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-label">Highest Score</div>
              <div className="stat-value">{displayStats.highestScore.toLocaleString()}</div>
              <div className={`stat-source ${displayStats.isWeb3Data ? 'blockchain' : 'local'}`}>
                {displayStats.isWeb3Data ? '🔗 On-Chain' : '💻 Local'}
              </div>
>>>>>>> master
            </div>
          </div>

          <div className="stat-item">
<<<<<<< HEAD
            <div className="stat-label">Total Score</div>
            <div className="stat-value">{displayStats.totalScore.toLocaleString()}</div>
            <div className={`stat-source ${web3State.playerData ? 'blockchain' : 'local'}`}>
              {web3State.playerData ? 'On-Chain' : 'Local'}
=======
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Total Score</div>
              <div className="stat-value">{displayStats.totalScore.toLocaleString()}</div>
              <div className={`stat-source ${displayStats.isWeb3Data ? 'blockchain' : 'local'}`}>
                {displayStats.isWeb3Data ? '🔗 On-Chain' : '💻 Local'}
              </div>
>>>>>>> master
            </div>
          </div>

          <div className="stat-item">
<<<<<<< HEAD
            <div className="stat-label">Highest Score</div>
            <div className="stat-value">{displayStats.highestScore.toLocaleString()}</div>
            <div className={`stat-source ${web3State.playerData ? 'blockchain' : 'local'}`}>
              {web3State.playerData ? 'On-Chain' : 'Local'}
=======
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{displayStats.averageScore.toLocaleString()}</div>
              <div className="stat-source calculated">📊 Calculated</div>
>>>>>>> master
            </div>
          </div>

          <div className="stat-item">
<<<<<<< HEAD
            <div className="stat-label">Avg Score</div>
            <div className="stat-value">{displayStats.averageScore.toLocaleString()}</div>
            <div className="stat-source local">Local</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Moles Hit</div>
            <div className="stat-value">{displayStats.molesHit.toLocaleString()}</div>
            <div className={`stat-source ${web3State.playerData ? 'blockchain' : 'local'}`}>
              {web3State.playerData ? 'On-Chain' : 'Local'}
=======
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Moles Hit</div>
              <div className="stat-value">{displayStats.molesHit.toLocaleString()}</div>
              <div className={`stat-source ${displayStats.isWeb3Data ? 'blockchain' : 'local'}`}>
                {displayStats.isWeb3Data ? '🔗 On-Chain' : '💻 Local'}
              </div>
>>>>>>> master
            </div>
          </div>

          <div className="stat-item">
<<<<<<< HEAD
            <div className="stat-label">NFT Achievements</div>
            <div className="stat-value">{displayStats.nftCount}</div>
            <div className="stat-source blockchain">On-Chain</div>
          </div>
=======
            <div className="stat-icon">🎖️</div>
            <div className="stat-content">
              <div className="stat-label">NFT Achievements</div>
              <div className="stat-value">{displayStats.nftCount}</div>
              <div className="stat-source blockchain">🔗 On-Chain</div>
            </div>
          </div>

          {additionalStats.accuracy > 0 && (
            <div className="stat-item">
              <div className="stat-icon">🎪</div>
              <div className="stat-content">
                <div className="stat-label">Accuracy</div>
                <div className="stat-value">{additionalStats.accuracy}%</div>
                <div className="stat-source calculated">📊 Calculated</div>
              </div>
            </div>
          )}

          {additionalStats.registrationDate && (
            <div className="stat-item">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-label">Member Since</div>
                <div className="stat-value member-date">{additionalStats.registrationDate}</div>
                <div className="stat-source blockchain">🔗 On-Chain</div>
              </div>
            </div>
          )}
        </div>
>>>>>>> master
        </div>

        {/* Achievements Section */}
        <AchievementsList 
          achievements={web3State.achievements}
          playerData={web3State.playerData}
          isLoading={isLoading}
        />

        {/* Leaderboard Section */}
        <Leaderboard 
          leaderboard={web3State.leaderboard}
          currentPlayer={web3State.account}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
<<<<<<< HEAD
=======

        {/* Debug Panel - Only show in development */}
        {process.env.NODE_ENV === 'development' && <Web3DataDebug />}
>>>>>>> master
      </div>
    </div>
  );
};

export default Dashboard;
