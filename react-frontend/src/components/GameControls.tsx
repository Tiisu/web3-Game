// Game controls component

import React from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/GameControls.css';

const GameControls: React.FC = () => {
  const { gameState, startGame, pauseGame, resumeGame, stopGame } = useGameContext();
  const { web3State, isLoading } = useWeb3();

  const isDisabled = isLoading ||
    (web3State.isConnected && web3State.playerData && !web3State.playerData.isRegistered) || false;

  const handleStart = async () => {
    if (isDisabled) return;
    await startGame();
  };

  const handlePause = () => {
    if (isDisabled) return;
    pauseGame();
  };

  const handleResume = () => {
    if (isDisabled) return;
    resumeGame();
  };

  const handleStop = async () => {
    if (isDisabled) return;
    await stopGame();
  };

  return (
    <div className="game-controls">
      <div className="control-buttons">
        {!gameState.isPlaying ? (
          <button
            className="control-btn start-btn"
            onClick={handleStart}
            disabled={isDisabled}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Starting...
              </>
            ) : (
              'START'
            )}
          </button>
        ) : (
          <>
            {!gameState.isPaused ? (
              <button
                className="control-btn pause-btn"
                onClick={handlePause}
                disabled={isDisabled}
              >
                PAUSE
              </button>
            ) : (
              <button
                className="control-btn resume-btn"
                onClick={handleResume}
                disabled={isDisabled}
              >
                RESUME
              </button>
            )}
            
            <button
              className="control-btn stop-btn"
              onClick={handleStop}
              disabled={isDisabled}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Stopping...
                </>
              ) : (
                'QUIT'
              )}
            </button>
          </>
        )}
      </div>

      {/* Connection status indicator */}
      {web3State.isConnected && (
        <div className="connection-status">
          {web3State.playerData?.isRegistered ? (
            <div className="status-indicator connected">
              <span className="status-icon">🔗</span>
              <span className="status-text">Web3 Connected</span>
            </div>
          ) : (
            <div className="status-indicator pending">
              <span className="status-icon">⚠️</span>
              <span className="status-text">Registration Required</span>
            </div>
          )}
        </div>
      )}

      {!web3State.isConnected && (
        <div className="connection-status">
          <div className="status-indicator local">
            <span className="status-icon">💻</span>
            <span className="status-text">Local Mode</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
