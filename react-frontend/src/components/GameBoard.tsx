// Game board component with mole grid

import React from 'react';
import { useGameContext } from '../contexts/GameContext';
import '../styles/GameBoard.css';

const GameBoard: React.FC = () => {
  const { moles, handleMoleClick, gameState } = useGameContext();

  // Create 3x3 grid
  const gridPositions = Array.from({ length: 9 }, (_, index) => index);

  const getMoleAtPosition = (position: number) => {
    return moles.find(mole => mole.position === position && mole.isVisible);
  };

  const handleCellClick = (position: number) => {
    if (gameState.gameOver || gameState.isPaused) return;
    handleMoleClick(position);
  };

  return (
    <div className="game-board">
      <div className="board-grid">
        {gridPositions.map(position => {
          const mole = getMoleAtPosition(position);
          
          return (
            <div
              key={position}
              className={`board-cell ${mole ? 'has-mole' : ''}`}
              onClick={() => handleCellClick(position)}
            >
              {/* Hole background */}
              <div className="hole">
                <div className="hole-inner"></div>
              </div>
              
              {/* Mole or plant */}
              {mole && (
                <div 
                  className={`mole ${mole.type} ${mole.isVisible ? 'visible' : ''}`}
                  data-points={mole.points}
                >
                  <img 
                    src={`/images/${mole.type}.png`}
                    alt={mole.type}
                    className="mole-image"
                    draggable={false}
                  />
                  
                  {/* Points indicator */}
                  {mole.type !== 'plant' && (
                    <div className="points-indicator">
                      +{mole.points}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Game state overlay */}
      {gameState.gameOver && !gameState.isPlaying && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Ready to Play?</h2>
            <p>Click START to begin your Whac-A-Mole adventure!</p>
          </div>
        </div>
      )}
      
      {gameState.isPaused && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>Game Paused</h2>
            <p>Click RESUME to continue playing</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
