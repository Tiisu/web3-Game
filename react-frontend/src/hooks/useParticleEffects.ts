// Enhanced Particle Effects Hook
// Provides modern gaming particle effects for visual feedback

import { useCallback, useRef } from 'react';

export interface ParticleConfig {
  type: 'score' | 'hit' | 'web3' | 'achievement' | 'levelup' | 'combo';
  x: number;
  y: number;
  count?: number;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  duration?: number;
}

export interface ParticleSystem {
  createParticles: (config: ParticleConfig) => void;
  createScoreBurst: (x: number, y: number, points: number) => void;
  createHitExplosion: (x: number, y: number) => void;
  createWeb3Success: (x: number, y: number) => void;
  createAchievementBurst: (x: number, y: number) => void;
  createLevelUpFountain: (x: number, y: number) => void;
  createComboSpiral: (x: number, y: number, multiplier: number) => void;
  clearAllParticles: () => void;
}

export const useParticleEffects = (): ParticleSystem => {
  const particleContainerRef = useRef<HTMLDivElement | null>(null);
  const activeParticles = useRef<Set<HTMLElement>>(new Set());

  // Get or create particle container
  const getParticleContainer = useCallback((): HTMLDivElement => {
    if (!particleContainerRef.current) {
      // Look for existing container
      let container = document.querySelector('.particle-container') as HTMLDivElement;
      
      if (!container) {
        // Create new container
        container = document.createElement('div');
        container.className = 'particle-container';
        document.body.appendChild(container);
      }
      
      particleContainerRef.current = container;
    }
    
    return particleContainerRef.current;
  }, []);

  // Create individual particle element
  const createParticleElement = useCallback((config: ParticleConfig): HTMLElement => {
    const particle = document.createElement('div');
    particle.className = `particle ${config.type}-particle`;
    
    // Set position
    particle.style.left = `${config.x}px`;
    particle.style.top = `${config.y}px`;
    
    // Set size
    const sizeMap = { small: '3px', medium: '6px', large: '10px' };
    const size = sizeMap[config.size || 'medium'];
    particle.style.width = size;
    particle.style.height = size;
    
    // Set custom color if provided
    if (config.color) {
      particle.style.background = config.color;
      particle.style.boxShadow = `0 0 10px ${config.color}`;
    }
    
    return particle;
  }, []);

  // Generic particle creation function
  const createParticles = useCallback((config: ParticleConfig) => {
    const container = getParticleContainer();
    const count = config.count || 1;
    
    for (let i = 0; i < count; i++) {
      const particle = createParticleElement({
        ...config,
        x: config.x + (Math.random() - 0.5) * 20,
        y: config.y + (Math.random() - 0.5) * 20,
      });
      
      // Add animation class based on type
      const animationClass = `${config.type}-${getAnimationType(config.type)}`;
      particle.classList.add(animationClass);
      
      container.appendChild(particle);
      activeParticles.current.add(particle);
      
      // Remove particle after animation
      const duration = config.duration || 1000;
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
        activeParticles.current.delete(particle);
      }, duration);
    }
  }, [getParticleContainer, createParticleElement]);

  // Get animation type based on particle type
  const getAnimationType = (type: string): string => {
    const animationMap: Record<string, string> = {
      score: 'burst',
      hit: 'explosion',
      web3: 'success',
      achievement: 'burst',
      levelup: 'fountain',
      combo: 'spiral'
    };
    return animationMap[type] || 'burst';
  };

  // Specific particle effect functions
  const createScoreBurst = useCallback((x: number, y: number, points: number) => {
    // Create score text particle
    const container = getParticleContainer();
    const scoreText = document.createElement('div');
    scoreText.className = 'score-text-particle';
    scoreText.textContent = `+${points}`;
    scoreText.style.left = `${x}px`;
    scoreText.style.top = `${y}px`;
    scoreText.style.position = 'absolute';
    scoreText.style.color = 'var(--accent-green-neon)';
    scoreText.style.fontWeight = 'bold';
    scoreText.style.fontSize = '1.2rem';
    scoreText.style.textShadow = '0 0 10px var(--accent-green-neon)';
    scoreText.style.pointerEvents = 'none';
    scoreText.style.zIndex = '1000';
    
    container.appendChild(scoreText);
    
    // Animate score text
    scoreText.animate([
      { transform: 'translateY(0) scale(0.5)', opacity: 0 },
      { transform: 'translateY(-20px) scale(1.2)', opacity: 1, offset: 0.3 },
      { transform: 'translateY(-60px) scale(0.8)', opacity: 0 }
    ], {
      duration: 1200,
      easing: 'ease-out'
    }).onfinish = () => {
      if (scoreText.parentNode) {
        scoreText.parentNode.removeChild(scoreText);
      }
    };
    
    // Create particle burst
    createParticles({
      type: 'score',
      x,
      y,
      count: 8,
      size: 'small',
      duration: 800
    });
  }, [createParticles, getParticleContainer]);

  const createHitExplosion = useCallback((x: number, y: number) => {
    const container = getParticleContainer();
    const explosion = document.createElement('div');
    explosion.className = 'hit-explosion';
    explosion.style.left = `${x - 50}px`;
    explosion.style.top = `${y - 50}px`;
    
    // Create explosion particles with different directions
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.className = 'explosion-particle';
      
      const angle = (i / 6) * Math.PI * 2;
      const distance = 30 + Math.random() * 30;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      
      explosion.appendChild(particle);
    }
    
    container.appendChild(explosion);
    
    setTimeout(() => {
      if (explosion.parentNode) {
        explosion.parentNode.removeChild(explosion);
      }
    }, 600);
  }, [getParticleContainer]);

  const createWeb3Success = useCallback((x: number, y: number) => {
    createParticles({
      type: 'web3',
      x,
      y,
      count: 12,
      size: 'medium',
      duration: 1000
    });
  }, [createParticles]);

  const createAchievementBurst = useCallback((x: number, y: number) => {
    createParticles({
      type: 'achievement',
      x,
      y,
      count: 15,
      size: 'large',
      duration: 1200
    });
  }, [createParticles]);

  const createLevelUpFountain = useCallback((x: number, y: number) => {
    // Create multiple waves of particles
    for (let wave = 0; wave < 3; wave++) {
      setTimeout(() => {
        createParticles({
          type: 'levelup',
          x: x + (Math.random() - 0.5) * 40,
          y,
          count: 8,
          size: 'medium',
          duration: 1500
        });
      }, wave * 200);
    }
  }, [createParticles]);

  const createComboSpiral = useCallback((x: number, y: number, multiplier: number) => {
    const count = Math.min(multiplier * 2, 20);
    createParticles({
      type: 'combo',
      x,
      y,
      count,
      size: 'small',
      duration: 1000
    });
  }, [createParticles]);

  const clearAllParticles = useCallback(() => {
    activeParticles.current.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    activeParticles.current.clear();
  }, []);

  return {
    createParticles,
    createScoreBurst,
    createHitExplosion,
    createWeb3Success,
    createAchievementBurst,
    createLevelUpFountain,
    createComboSpiral,
    clearAllParticles
  };
};
