import React, { useState, useEffect } from 'react';
import '../styles/UIEnhancementDemo.css';

interface UIEnhancementDemoProps {
  onClose: () => void;
}

const UIEnhancementDemo: React.FC<UIEnhancementDemoProps> = ({ onClose }) => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const demos = [
    {
      title: "Enhanced Game Board",
      description: "Modern visual effects with hover states, click feedback, and smooth animations",
      component: <GameBoardDemo />
    },
    {
      title: "Modern Control Interface", 
      description: "Gradient buttons with loading states and micro-interactions",
      component: <ControlsDemo />
    },
    {
      title: "Advanced Dashboard",
      description: "Animated counters, data visualization, and modern card layouts",
      component: <DashboardDemo />
    },
    {
      title: "Particle Effects",
      description: "Engaging visual feedback with particle explosions and animations",
      component: <ParticleDemo />
    },
    {
      title: "Web3 Integration UI",
      description: "Enhanced wallet connection and transaction feedback",
      component: <Web3Demo />
    }
  ];

  const nextDemo = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDemo((prev) => (prev + 1) % demos.length);
      setIsAnimating(false);
    }, 300);
  };

  const prevDemo = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDemo((prev) => (prev - 1 + demos.length) % demos.length);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="ui-demo-overlay">
      <div className="ui-demo-container">
        <div className="demo-header">
          <h2>🎮 UI Enhancement Showcase</h2>
          <button className="demo-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="demo-navigation">
          <button onClick={prevDemo} className="nav-btn">‹</button>
          <div className="demo-indicators">
            {demos.map((_, index) => (
              <div 
                key={index}
                className={`indicator ${index === currentDemo ? 'active' : ''}`}
                onClick={() => setCurrentDemo(index)}
              />
            ))}
          </div>
          <button onClick={nextDemo} className="nav-btn">›</button>
        </div>

        <div className={`demo-content ${isAnimating ? 'animating' : ''}`}>
          <div className="demo-info">
            <h3>{demos[currentDemo].title}</h3>
            <p>{demos[currentDemo].description}</p>
          </div>
          <div className="demo-showcase">
            {demos[currentDemo].component}
          </div>
        </div>

        <div className="demo-footer">
          <span>{currentDemo + 1} of {demos.length}</span>
        </div>
      </div>
    </div>
  );
};

// Demo Components
const GameBoardDemo: React.FC = () => (
  <div className="demo-game-board">
    <div className="demo-board-grid">
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="demo-board-cell">
          <div className="demo-hole">
            <div className="demo-hole-inner"></div>
          </div>
          {i === 4 && (
            <div className="demo-mole visible">
              <img src="/images/mole.png" alt="mole" className="demo-mole-image" />
              <div className="demo-points-indicator">+10</div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const ControlsDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="demo-controls">
      <button className={`demo-control-btn start-btn ${loading ? 'loading' : ''}`} onClick={handleClick}>
        START GAME
      </button>
      <button className="demo-control-btn pause-btn">PAUSE</button>
      <button className="demo-control-btn stop-btn">STOP</button>
    </div>
  );
};

const DashboardDemo: React.FC = () => {
  const [score, setScore] = useState(1250);

  useEffect(() => {
    const interval = setInterval(() => {
      setScore(prev => prev + Math.floor(Math.random() * 50));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="demo-dashboard">
      <div className="demo-stat-item">
        <div className="demo-stat-label">Score</div>
        <div className="demo-stat-value updating">{score.toLocaleString()}</div>
      </div>
      <div className="demo-stat-item">
        <div className="demo-stat-label">Level</div>
        <div className="demo-stat-value">5</div>
      </div>
      <div className="demo-stat-item achievement-unlocked">
        <div className="demo-stat-label">Achievements</div>
        <div className="demo-stat-value">12</div>
      </div>
    </div>
  );
};

const ParticleDemo: React.FC = () => {
  const [showParticles, setShowParticles] = useState(false);

  const triggerParticles = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
  };

  return (
    <div className="demo-particles" onClick={triggerParticles}>
      <div className="demo-target">
        Click for Particles!
      </div>
      {showParticles && (
        <div className="demo-particle-container">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="demo-particle" style={{
              '--dx': `${(Math.random() - 0.5) * 100}px`,
              '--dy': `${(Math.random() - 0.5) * 100}px`
            } as React.CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
};

const Web3Demo: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const handleConnect = () => {
    setStatus('connecting');
    setTimeout(() => setStatus('connected'), 2000);
  };

  return (
    <div className="demo-web3">
      <div className={`demo-wallet-status ${status}`}>
        <div className="demo-status-icon">
          {status === 'connected' ? '🟢' : status === 'connecting' ? '🟡' : '🔴'}
        </div>
        <div className="demo-status-text">
          {status === 'connected' ? 'Wallet Connected' : 
           status === 'connecting' ? 'Connecting...' : 'Wallet Disconnected'}
        </div>
      </div>
      {status === 'disconnected' && (
        <button className="demo-connect-btn" onClick={handleConnect}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default UIEnhancementDemo;
