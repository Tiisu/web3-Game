// Dashboard component with stats, achievements, and leaderboard

import React, { useEffect, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import AchievementsList from './AchievementsList';
import Leaderboard from './Leaderboard';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { web3State, refreshData, isLoading } = useWeb3();
  const { gameStats } = useGameContext();
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
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Player Stats</h2>
          {web3State.isConnected && (
            <button 
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh blockchain data"
            >
              🔄
            </button>
          )}
        </div>

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

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Games Played</div>
            <div className="stat-value">{displayStats.gamesPlayed}</div>
            <div className={`stat-source ${web3State.playerData ? 'blockchain' : 'local'}`}>
              {web3State.playerData ? 'On-Chain' : 'Local'}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Total Score</div>
            <div className="stat-value">{displayStats.totalScore.toLocaleString()}</div>
            <div className={`stat-source ${web3State.playerData ? 'blockchain' : 'local'}`}>
              {web3State.playerData ? 'On-Chain' : 'Local'}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Highest Score</div>
            <div className="stat-value">{displayStats.highestScore.toLocaleString()}</div>
            <div className={`stat-source ${web3State.playerData ? 'blockchain' : 'local'}`}>
              {web3State.playerData ? 'On-Chain' : 'Local'}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Avg Score</div>
            <div className="stat-value">{displayStats.averageScore.toLocaleString()}</div>
            <div className="stat-source local">Local</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Moles Hit</div>
            <div className="stat-value">{displayStats.molesHit.toLocaleString()}</div>
            <div className={`stat-source ${web3State.playerData ? 'blockchain' : 'local'}`}>
              {web3State.playerData ? 'On-Chain' : 'Local'}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-label">NFT Achievements</div>
            <div className="stat-value">{displayStats.nftCount}</div>
            <div className="stat-source blockchain">On-Chain</div>
          </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
