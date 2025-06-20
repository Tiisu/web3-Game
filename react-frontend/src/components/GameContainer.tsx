// Main game container component

import React, { useEffect } from 'react';
import WalletConnection from './WalletConnection';
import PlayerRegistration from './PlayerRegistration';
import GameBoard from './GameBoard';
import Dashboard from './Dashboard';
import GameControls from './GameControls';
import NotificationContainer from './NotificationContainer';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import '../styles/GameContainer.css';

const GameContainer: React.FC = () => {
  const { web3State } = useWeb3();
  const { gameState } = useGameContext();

  // Check if player needs to register
  const needsRegistration = web3State.isConnected && 
                           web3State.account && 
                           (!web3State.playerData || !web3State.playerData.isRegistered);

  return (
    <div className="game-container">
      {/* Web3 Connection UI */}
      <WalletConnection />

      {/* Player Registration Modal */}
      {needsRegistration && (
        <PlayerRegistration
          isOpen={needsRegistration}
          onClose={() => {}} // Can't close until registered
        />
      )}

      {/* Main Game Area */}
      <div className="game-area">
        <h1><span className="title">WHAC-A-MOLE</span></h1>
        
        {/* Game Board */}
        <GameBoard />
        
        {/* Game Controls */}
        <GameControls />
        
        {/* Game Info Display */}
        <div className="game-info">
          <div className="score-display">
            <span className="score-label">Score:</span>
            <span className="score-value" id="score">{gameState.score}</span>
          </div>
          
          <div className="timer-display">
            <span className="timer-label">Time:</span>
            <span className="timer-value" id="timer">
              {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="level-display">
            <span className="level-label">Level:</span>
            <span className="level-value" id="level">{gameState.currentLevel}</span>
          </div>
        </div>

        {/* High Score Display */}
        <div className="high-score-container">
          <div className="high-score">
            <span className="high-score-label">High Score:</span>
            <span className="high-score-value" id="highScore">
              {web3State.playerData?.highestScore || 0}
            </span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="level-progress-container">
          <div className="level-progress-bar">
            <div 
              className="level-progress-fill" 
              style={{
                width: `${Math.min((gameState.score / gameState.pointsToNextLevel) * 100, 100)}%`
              }}
            ></div>
          </div>
          <div className="level-progress-text">
            {gameState.currentLevel < 5 ? 
              `${gameState.score} / ${gameState.pointsToNextLevel} to next level` :
              'Max Level Reached!'
            }
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <Dashboard />

      {/* Notifications */}
      <NotificationContainer />

      {/* Game Over Toast */}
      <div id="toast" className="toast">
        <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>GAME OVER!</div>
        <div>Final Score: {gameState.score}</div>
        {web3State.isConnected && web3State.playerData?.isRegistered ? (
          <div style={{ fontSize: '0.9rem', color: '#4CAF50' }}>✅ Saved to ApeChain</div>
        ) : (
          <div style={{ fontSize: '0.9rem', color: '#ff9800' }}>⚠️ Local game only</div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;
