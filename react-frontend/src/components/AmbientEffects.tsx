// Ambient Gaming Atmosphere Effects

import React, { useEffect, useState } from 'react';
import { useGameContext } from '../contexts/GameContext';
import '../styles/AmbientEffects.css';

const AmbientEffects: React.FC = () => {
  const { gameState } = useGameContext();
  const [particles, setParticles] = useState<Array<{id: string, x: number, y: number, delay: number}>>([]);

  // Generate ambient particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: `particle-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 10000); // Regenerate every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ambient-effects">
      {/* Subtle Background Gradient */}
      <div className="ambient-gradient"></div>

      {/* Floating Particles */}
      <div className="ambient-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="ambient-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          ></div>
        ))}
      </div>

      {/* Dynamic Light Rays */}
      <div className="light-rays">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="light-ray"
            style={{
              '--angle': `${i * 60}deg`,
              '--delay': `${i * 0.5}s`
            } as React.CSSProperties}
          ></div>
        ))}
      </div>

      {/* Gaming Mode Enhancements */}
      {gameState.isPlaying && (
        <>
          {/* Active Gaming Aura */}
          <div className="gaming-aura">
            <div className="aura-ring primary"></div>
            <div className="aura-ring secondary"></div>
            <div className="aura-ring tertiary"></div>
          </div>

          {/* Energy Pulses */}
          <div className="energy-pulses">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="energy-pulse"
                style={{
                  '--delay': `${i * 0.8}s`,
                  '--size': `${200 + i * 100}px`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>
        </>
      )}

      {/* Combo Mode Special Effects */}
      {gameState.currentStreak >= 5 && gameState.isPlaying && (
        <div className="combo-atmosphere">
          {/* Fire Particles */}
          <div className="fire-particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="fire-particle"
                style={{
                  '--x': `${Math.random() * 100}%`,
                  '--y': `${Math.random() * 100}%`,
                  '--delay': `${Math.random() * 2}s`,
                  '--duration': `${2 + Math.random() * 2}s`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>

          {/* Combo Aura */}
          <div className="combo-aura">
            <div className="combo-ring"></div>
            <div className="combo-glow"></div>
          </div>
        </div>
      )}

      {/* Super Combo Effects */}
      {gameState.currentStreak >= 10 && gameState.isPlaying && (
        <div className="super-combo-atmosphere">
          {/* Lightning Effects */}
          <div className="lightning-effects">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="lightning-bolt"
                style={{
                  '--angle': `${i * 45}deg`,
                  '--delay': `${Math.random() * 1}s`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>

          {/* Energy Storm */}
          <div className="energy-storm">
            <div className="storm-center"></div>
            <div className="storm-rings">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="storm-ring"
                  style={{
                    '--delay': `${i * 0.2}s`,
                    '--size': `${100 + i * 50}px`
                  } as React.CSSProperties}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time Critical Atmosphere */}
      {gameState.timeLeft <= 10 && gameState.isPlaying && (
        <div className="time-critical-atmosphere">
          {/* Warning Pulses */}
          <div className="warning-pulses">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="warning-pulse"
                style={{
                  '--delay': `${i * 0.3}s`,
                  '--size': `${300 + i * 100}px`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>

          {/* Critical Vignette */}
          <div className="critical-vignette-ambient"></div>
        </div>
      )}

      {/* Pause State Atmosphere */}
      {gameState.isPaused && (
        <div className="pause-atmosphere">
          <div className="pause-overlay"></div>
          <div className="pause-particles">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="pause-particle"
                style={{
                  '--x': `${Math.random() * 100}%`,
                  '--y': `${Math.random() * 100}%`,
                  '--delay': `${Math.random() * 3}s`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Subtle Corner Decorations */}
      <div className="corner-decorations">
        <div className="corner-decoration top-left"></div>
        <div className="corner-decoration top-right"></div>
        <div className="corner-decoration bottom-left"></div>
        <div className="corner-decoration bottom-right"></div>
      </div>

      {/* Dynamic Background Pattern */}
      <div className="background-pattern">
        <div className="pattern-grid">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="pattern-dot"
              style={{
                '--delay': `${Math.random() * 5}s`
              } as React.CSSProperties}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AmbientEffects;
