// Landing Page Component - Inspired by Legend of Werewolf design

import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/LandingPage.css';

interface LandingPageProps {
  onStartTrial: () => void;
  onConnectWallet: () => void;
  trialUsed: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartTrial, 
  onConnectWallet, 
  trialUsed 
}) => {
  const { web3State, isLoading } = useWeb3();

  const handleGetStarted = () => {
    if (web3State.isConnected) {
      // User is connected, navigate to game
      return;
    } else if (!trialUsed) {
      // Allow trial play
      onStartTrial();
    } else {
      // Trial used, require wallet connection
      onConnectWallet();
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">Whac-A-Mole Web3</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#nfts" className="nav-link">NFTs</a>
            <a href="#roadmap" className="nav-link">Roadmap</a>
            <button 
              className={`connect-wallet-nav-btn ${isLoading ? 'loading' : ''}`}
              onClick={onConnectWallet}
              disabled={isLoading}
            >
              {web3State.isConnected ? 
                `Connected: ${web3State.account?.slice(0, 6)}...${web3State.account?.slice(-4)}` :
                '🦍 Connect Wallet'
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Whac-A-Mole Web3
            </h1>
            <p className="hero-subtitle">
              The classic arcade game reimagined for the blockchain era. 
              Play, compete, and earn NFT achievements on ApeChain while 
              climbing the global leaderboard.
            </p>
            <div className="hero-actions">
              <button 
                className="cta-primary"
                onClick={handleGetStarted}
              >
                {web3State.isConnected ? 
                  'Play Now' : 
                  trialUsed ? 
                    'Connect Wallet to Play' : 
                    'Try Free Demo'
                }
              </button>
              {!web3State.isConnected && !trialUsed && (
                <button 
                  className="cta-secondary"
                  onClick={onConnectWallet}
                >
                  Connect Wallet
                </button>
              )}
            </div>
            {!web3State.isConnected && (
              <div className="hero-notice">
                {trialUsed ? (
                  <p className="trial-used-notice">
                    🎮 Trial completed! Connect your wallet to continue playing and unlock Web3 features.
                  </p>
                ) : (
                  <p className="trial-available-notice">
                    🎯 Try the game once for free, then connect your wallet for full access!
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="hero-visual">
            <div className="game-preview">
              <div className="preview-board">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="preview-hole">
                    {i === 2 || i === 5 || i === 7 ? (
                      <div className="preview-mole">🐹</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <h2 className="section-title">Game Features</h2>
          <p className="section-subtitle">
            Experience the classic game with modern Web3 enhancements
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3 className="feature-title">Classic Gameplay</h3>
              <p className="feature-description">
                Enjoy the timeless Whac-A-Mole experience with smooth animations and responsive controls
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">Global Leaderboard</h3>
              <p className="feature-description">
                Compete with players worldwide on our blockchain-powered leaderboard system
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">NFT Achievements</h3>
              <p className="feature-description">
                Unlock unique NFT achievements as you master the game and reach new milestones
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🦍</div>
              <h3 className="feature-title">ApeChain Integration</h3>
              <p className="feature-description">
                Built on ApeChain for fast, low-cost transactions and seamless Web3 experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Showcase Section */}
      <section id="nfts" className="nft-section">
        <div className="section-container">
          <h2 className="section-title">NFT Achievements</h2>
          <p className="section-subtitle">
            Collect unique NFT achievements as you master the game
          </p>
          <div className="nft-showcase">
            <div className="nft-card">
              <div className="nft-image">🏆</div>
              <h4 className="nft-title">First Victory</h4>
              <p className="nft-description">Complete your first game</p>
            </div>
            <div className="nft-card">
              <div className="nft-image">⚡</div>
              <h4 className="nft-title">Speed Demon</h4>
              <p className="nft-description">Hit 10 moles in 5 seconds</p>
            </div>
            <div className="nft-card">
              <div className="nft-image">🎯</div>
              <h4 className="nft-title">Perfect Accuracy</h4>
              <p className="nft-description">100% hit rate in a game</p>
            </div>
            <div className="nft-card">
              <div className="nft-image">👑</div>
              <h4 className="nft-title">Leaderboard King</h4>
              <p className="nft-description">Reach #1 on leaderboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="roadmap-section">
        <div className="section-container">
          <h2 className="section-title">Roadmap</h2>
          <div className="roadmap-timeline">
            <div className="roadmap-phase">
              <div className="phase-number">1</div>
              <div className="phase-content">
                <h3 className="phase-title">Launch Phase</h3>
                <ul className="phase-items">
                  <li>✅ Core game mechanics</li>
                  <li>✅ ApeChain integration</li>
                  <li>✅ Basic NFT achievements</li>
                </ul>
              </div>
            </div>
            <div className="roadmap-phase">
              <div className="phase-number">2</div>
              <div className="phase-content">
                <h3 className="phase-title">Enhancement Phase</h3>
                <ul className="phase-items">
                  <li>🔄 Advanced achievements</li>
                  <li>🔄 Tournament system</li>
                  <li>🔄 Social features</li>
                </ul>
              </div>
            </div>
            <div className="roadmap-phase">
              <div className="phase-number">3</div>
              <div className="phase-content">
                <h3 className="phase-title">Expansion Phase</h3>
                <ul className="phase-items">
                  <li>📋 Mobile app</li>
                  <li>📋 Multiplayer modes</li>
                  <li>📋 Token rewards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Playing?</h2>
            <p className="cta-description">
              Join thousands of players competing on ApeChain
            </p>
            <button
              className="cta-button"
              onClick={handleGetStarted}
            >
              {web3State.isConnected ?
                'Enter Game' :
                trialUsed ?
                  'Connect Wallet' :
                  'Start Free Trial'
              }
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">Whac-A-Mole Web3</span>
            </div>
            <div className="footer-links">
              <button className="footer-link">Privacy Policy</button>
              <button className="footer-link">Terms of Service</button>
              <button className="footer-link">Support</button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Whac-A-Mole Web3. Built on ApeChain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
