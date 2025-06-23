// Enhanced Feedback System for interactive elements

import React, { useEffect, useState, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useWeb3 } from '../contexts/Web3Context';
import '../styles/FeedbackSystem.css';

interface FeedbackEvent {
  id: string;
  type: 'hit' | 'miss' | 'combo' | 'achievement' | 'web3-success' | 'web3-error';
  position?: { x: number; y: number };
  value?: number;
  message?: string;
  timestamp: number;
}

const FeedbackSystem: React.FC = () => {
  const { gameState, gameStats } = useGameContext();
  const { web3State, pendingTransaction } = useWeb3();
  const [feedbackEvents, setFeedbackEvents] = useState<FeedbackEvent[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  // Add feedback event
  const addFeedbackEvent = useCallback((event: Omit<FeedbackEvent, 'id' | 'timestamp'>) => {
    const feedbackEvent: FeedbackEvent = {
      ...event,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };

    setFeedbackEvents(prev => [...prev, feedbackEvent]);

    // Auto-remove after animation duration
    setTimeout(() => {
      setFeedbackEvents(prev => prev.filter(e => e.id !== feedbackEvent.id));
    }, 2000);

    // Trigger screen shake for certain events
    if (event.type === 'combo' || event.type === 'achievement') {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);
    }
  }, []);

  // Listen for game events
  useEffect(() => {
    // Combo achievements
    if (gameState.currentStreak === 5) {
      addFeedbackEvent({
        type: 'combo',
        message: 'COMBO x5!',
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      });
    } else if (gameState.currentStreak === 10) {
      addFeedbackEvent({
        type: 'combo',
        message: 'LEGENDARY COMBO!',
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      });
    }
  }, [gameState.currentStreak, addFeedbackEvent]);

  // Listen for Web3 events
  useEffect(() => {
    if (pendingTransaction) {
      // Show processing feedback
      addFeedbackEvent({
        type: 'web3-success',
        message: 'Processing transaction...',
        position: { x: window.innerWidth - 200, y: 100 }
      });
    }
  }, [pendingTransaction, addFeedbackEvent]);

  // Global click handler for ripple effects
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Add ripple effect to interactive elements
      if (target.classList.contains('interactive') || 
          target.closest('.interactive') ||
          target.tagName === 'BUTTON') {
        
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create ripple element
        const ripple = document.createElement('div');
        ripple.className = 'feedback-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        target.style.position = 'relative';
        target.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 600);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className={`feedback-system ${screenShake ? 'screen-shake' : ''}`}>
      {/* Feedback Events */}
      {feedbackEvents.map(event => (
        <div
          key={event.id}
          className={`feedback-event ${event.type}`}
          style={{
            left: event.position?.x || 0,
            top: event.position?.y || 0,
          }}
        >
          {event.type === 'hit' && (
            <div className="hit-feedback">
              <div className="hit-icon">💥</div>
              <div className="hit-value">+{event.value}</div>
            </div>
          )}
          
          {event.type === 'miss' && (
            <div className="miss-feedback">
              <div className="miss-icon">💨</div>
              <div className="miss-text">Miss!</div>
            </div>
          )}
          
          {event.type === 'combo' && (
            <div className="combo-feedback">
              <div className="combo-icon">🔥</div>
              <div className="combo-text">{event.message}</div>
              <div className="combo-particles">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="combo-particle" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}></div>
                ))}
              </div>
            </div>
          )}
          
          {event.type === 'achievement' && (
            <div className="achievement-feedback">
              <div className="achievement-icon">🏆</div>
              <div className="achievement-text">{event.message}</div>
              <div className="achievement-glow"></div>
            </div>
          )}
          
          {event.type === 'web3-success' && (
            <div className="web3-success-feedback">
              <div className="web3-icon">⛓️</div>
              <div className="web3-text">{event.message}</div>
              <div className="web3-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>
            </div>
          )}
          
          {event.type === 'web3-error' && (
            <div className="web3-error-feedback">
              <div className="error-icon">❌</div>
              <div className="error-text">{event.message}</div>
            </div>
          )}
        </div>
      ))}

      {/* Global Screen Effects */}
      {gameState.currentStreak >= 5 && gameState.isPlaying && (
        <div className="combo-screen-effect">
          <div className="combo-overlay"></div>
          <div className="combo-particles-bg">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="bg-particle" 
                style={{ 
                  '--delay': `${i * 0.2}s`,
                  '--x': `${Math.random() * 100}%`,
                  '--y': `${Math.random() * 100}%`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Time Critical Warning */}
      {gameState.timeLeft <= 10 && gameState.isPlaying && (
        <div className="time-critical-effect">
          <div className="critical-overlay"></div>
          <div className="critical-pulse"></div>
        </div>
      )}

      {/* Web3 Transaction Overlay */}
      {pendingTransaction && (
        <div className="web3-transaction-overlay">
          <div className="transaction-indicator">
            <div className="transaction-spinner"></div>
            <div className="transaction-text">
              <div className="transaction-title">Blockchain Transaction</div>
              <div className="transaction-message">{pendingTransaction.message}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSystem;
