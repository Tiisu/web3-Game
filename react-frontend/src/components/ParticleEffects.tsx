// Particle effects component for enhanced visual feedback

import React, { useEffect, useState } from 'react';
import '../styles/ParticleEffects.css';

interface Particle {
  id: string;
  x: number;
  y: number;
  type: 'hit' | 'miss' | 'combo' | 'levelup' | 'special';
  timestamp: number;
}

interface ParticleEffectsProps {
  gameState: {
    score: number;
    currentStreak: number;
    currentLevel: number;
    isPlaying: boolean;
  };
  onParticleEvent?: (type: string, position: { x: number; y: number }) => void;
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({ 
  gameState, 
  onParticleEvent 
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastScore, setLastScore] = useState(0);
  const [lastStreak, setLastStreak] = useState(0);
  const [lastLevel, setLastLevel] = useState(1);

  // Generate particles based on game state changes
  useEffect(() => {
    if (!gameState.isPlaying) return;

    // Score increase particles
    if (gameState.score > lastScore) {
      const scoreIncrease = gameState.score - lastScore;
      if (scoreIncrease > 0) {
        createParticles('hit', Math.min(scoreIncrease / 10, 5));
      }
      setLastScore(gameState.score);
    }

    // Streak particles
    if (gameState.currentStreak > lastStreak && gameState.currentStreak >= 3) {
      createParticles('combo', gameState.currentStreak >= 5 ? 8 : 5);
      onParticleEvent?.('combo', { x: 275, y: 275 }); // Center of game board
    }
    setLastStreak(gameState.currentStreak);

    // Level up particles
    if (gameState.currentLevel > lastLevel) {
      createParticles('levelup', 12);
      onParticleEvent?.('levelup', { x: 275, y: 275 });
    }
    setLastLevel(gameState.currentLevel);
  }, [gameState, lastScore, lastStreak, lastLevel, onParticleEvent]);

  const createParticles = (type: Particle['type'], count: number) => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const particle: Particle = {
        id: `${type}-${Date.now()}-${i}`,
        x: Math.random() * 550, // Game board width
        y: Math.random() * 550, // Game board height
        type,
        timestamp: Date.now(),
      };
      newParticles.push(particle);
    }

    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => 
        prev.filter(p => !newParticles.some(np => np.id === p.id))
      );
    }, 2000);
  };

  const createHitParticles = (x: number, y: number) => {
    const hitParticles: Particle[] = [];
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * (Math.PI / 180);
      const distance = 30 + Math.random() * 20;
      
      const particle: Particle = {
        id: `hit-${Date.now()}-${i}`,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        type: 'hit',
        timestamp: Date.now(),
      };
      hitParticles.push(particle);
    }

    setParticles(prev => [...prev, ...hitParticles]);

    setTimeout(() => {
      setParticles(prev => 
        prev.filter(p => !hitParticles.some(hp => hp.id === p.id))
      );
    }, 1000);
  };

  const createMissParticles = (x: number, y: number) => {
    const missParticles: Particle[] = [];
    
    for (let i = 0; i < 3; i++) {
      const particle: Particle = {
        id: `miss-${Date.now()}-${i}`,
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        type: 'miss',
        timestamp: Date.now(),
      };
      missParticles.push(particle);
    }

    setParticles(prev => [...prev, ...missParticles]);

    setTimeout(() => {
      setParticles(prev => 
        prev.filter(p => !missParticles.some(mp => mp.id === p.id))
      );
    }, 800);
  };

  // Expose methods for external use
  useEffect(() => {
    (window as any).createHitParticles = createHitParticles;
    (window as any).createMissParticles = createMissParticles;
    
    return () => {
      delete (window as any).createHitParticles;
      delete (window as any).createMissParticles;
    };
  }, []);

  const getParticleEmoji = (type: Particle['type']) => {
    switch (type) {
      case 'hit': return '✨';
      case 'miss': return '💨';
      case 'combo': return '🔥';
      case 'levelup': return '⭐';
      case 'special': return '💎';
      default: return '✨';
    }
  };

  const getParticleClass = (type: Particle['type']) => {
    return `particle particle-${type}`;
  };

  return (
    <div className="particle-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={getParticleClass(particle.type)}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
          }}
        >
          {getParticleEmoji(particle.type)}
        </div>
      ))}
      
      {/* Ambient particles for active game */}
      {gameState.isPlaying && (
        <div className="ambient-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={`ambient-${i}`}
              className="ambient-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Combo streak effects */}
      {gameState.currentStreak >= 5 && gameState.isPlaying && (
        <div className="streak-aura">
          <div className="streak-ring"></div>
          <div className="streak-ring streak-ring-2"></div>
        </div>
      )}

      {/* Level up celebration */}
      {gameState.currentLevel > 1 && (
        <div className="level-celebration">
          {[...Array(8)].map((_, i) => (
            <div
              key={`level-${i}`}
              className="level-star"
              style={{
                transform: `rotate(${i * 45}deg)`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticleEffects;
