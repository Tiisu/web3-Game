// Individual notification component

import React, { useEffect, useState } from 'react';
import { NotificationProps } from '../types';
import { useNotificationContext } from '../contexts/NotificationContext';
import '../styles/Notification.css';

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  const { removeNotification } = useNotificationContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide if specified
  useEffect(() => {
    if (notification.autoHide) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.autoHide]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300); // Match CSS animation duration
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'achievement':
        return '🏆';
      case 'leaderboard':
        return '📋';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationClass = () => {
    let className = `notification notification-${notification.type}`;
    if (isVisible) className += ' visible';
    if (isExiting) className += ' exiting';
    return className;
  };

  return (
    <div className={getNotificationClass()}>
      <div className="notification-content">
        <div className="notification-icon">
          {getNotificationIcon()}
        </div>
        
        <div className="notification-text">
          <div className="notification-title">
            {notification.title}
          </div>
          <div className="notification-message">
            {notification.message}
          </div>
        </div>
        
        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Notification;
