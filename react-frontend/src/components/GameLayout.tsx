// Enhanced Game Layout Component for better UI organization

import React from 'react';
import { motion } from 'framer-motion';
import '../styles/GameLayout.css';

interface GameLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface GameSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  animated?: boolean;
}

interface GamePanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

// Main Game Layout Container
export const GameLayout: React.FC<GameLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`game-layout ${className}`}>
      {children}
    </div>
  );
};

// Game Section with optional title and variants
export const GameSection: React.FC<GameSectionProps> = ({ 
  children, 
  title, 
  className = '', 
  variant = 'primary',
  animated = true 
}) => {
  const content = (
    <section className={`game-section game-section--${variant} ${className}`}>
      {title && (
        <div className="game-section__header">
          <h2 className="game-section__title">{title}</h2>
        </div>
      )}
      <div className="game-section__content">
        {children}
      </div>
    </section>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Game Panel for containing related UI elements
export const GamePanel: React.FC<GamePanelProps> = ({ 
  children, 
  className = '', 
  variant = 'glass',
  padding = 'md',
  hover = true 
}) => {
  return (
    <div className={`game-panel game-panel--${variant} game-panel--${padding} ${hover ? 'game-panel--hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Game Grid for organizing multiple panels
interface GameGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 'auto';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GameGrid: React.FC<GameGridProps> = ({ 
  children, 
  columns = 'auto', 
  gap = 'md',
  className = '' 
}) => {
  return (
    <div className={`game-grid game-grid--${columns} game-grid--gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

// Game Header for titles and navigation
interface GameHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  title, 
  subtitle, 
  actions, 
  className = '' 
}) => {
  return (
    <motion.header 
      className={`game-header ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="game-header__content">
        <div className="game-header__text">
          <h1 className="game-header__title">{title}</h1>
          {subtitle && <p className="game-header__subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div className="game-header__actions">
            {actions}
          </div>
        )}
      </div>
    </motion.header>
  );
};

// Game Stats Bar for displaying key metrics
interface GameStatsBarProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }>;
  className?: string;
}

export const GameStatsBar: React.FC<GameStatsBarProps> = ({ stats, className = '' }) => {
  return (
    <div className={`game-stats-bar ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className={`game-stat game-stat--${stat.variant || 'default'}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          {stat.icon && <div className="game-stat__icon">{stat.icon}</div>}
          <div className="game-stat__content">
            <div className="game-stat__value">{stat.value}</div>
            <div className="game-stat__label">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GameLayout;