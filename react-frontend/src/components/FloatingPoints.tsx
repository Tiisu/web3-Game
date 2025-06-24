// Floating Points Component for visual feedback

import React, { useState, useEffect } from 'react';
import '../styles/FloatingPoints.css';

interface FloatingPoint {
  id: string;
  points: number;
  position: number;
  isBonus: boolean;
  timestamp: number;
}

interface FloatingPointsProps {
  gameState: any;
  moles: any[];
}

const FloatingPoints: React.FC<FloatingPointsProps> = ({ gameState, moles }) => {
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [lastScore, setLastScore] = useState(0);

  // Track score changes to create floating points
  useEffect(() => {
    if (gameState.score > lastScore && gameState.isPlaying) {
      const pointsGained = gameState.score - lastScore;
      const isBonus = gameState.currentStreak >= 5;
      
      // Create floating point at a random position
      const newFloatingPoint: FloatingPoint = {
        id: `points-${Date.now()}-${Math.random()}`,
        points: pointsGained,
        position: Math.floor(Math.random() * 9), // Random grid position
        isBonus,
        timestamp: Date.now()
      };

      setFloatingPoints(prev => [...prev, newFloatingPoint]);

      // Remove floating point after animation
      setTimeout(() => {
        setFloatingPoints(prev => prev.filter(fp => fp.id !== newFloatingPoint.id));
      }, 2000);
    }
    
    setLastScore(gameState.score);
  }, [gameState.score, gameState.isPlaying, gameState.currentStreak, lastScore]);

  // Clean up floating points when game resets
  useEffect(() => {
    if (!gameState.isPlaying && gameState.gameOver) {
      setFloatingPoints([]);
      setLastScore(0);
    }
  }, [gameState.isPlaying, gameState.gameOver]);

  return (
    <div className="floating-points-container">
      {floatingPoints.map(fp => (
        <div
          key={fp.id}
          className={`floating-point ${fp.isBonus ? 'bonus-points' : 'normal-points'}`}
          style={{
            '--grid-position': fp.position,
            '--animation-delay': '0s'
          } as React.CSSProperties}
        >
          +{fp.points}
          {fp.isBonus && <span className="bonus-indicator">🔥</span>}
        </div>
      ))}
    </div>
  );
};

export default FloatingPoints;
