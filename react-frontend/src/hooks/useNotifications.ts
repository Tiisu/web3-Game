// Custom hook for managing notifications

import { useState, useCallback } from 'react';
import { UseNotificationsReturn, NotificationData } from '../types';

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Add notification
  const addNotification = useCallback((
    notification: Omit<NotificationData, 'id' | 'timestamp'>
  ) => {
    const newNotification: NotificationData = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      autoHide: notification.autoHide !== false // Default to true
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after 5 seconds if autoHide is true
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Add achievement notification
  const addAchievementNotification = useCallback((achievement: string) => {
    addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked! 🏆',
      message: `You earned the ${achievement} achievement!`,
      autoHide: true
    });
  }, [addNotification]);

  // Add leaderboard notification
  const addLeaderboardNotification = useCallback((position: number, score: number) => {
    addNotification({
      type: 'leaderboard',
      title: 'Leaderboard Updated! 📋',
      message: `Rank #${position} with ${score.toLocaleString()} points`,
      autoHide: true
    });
  }, [addNotification]);

  // Add success notification
  const addSuccessNotification = useCallback((message: string) => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message,
      autoHide: true
    });
  }, [addNotification]);

  // Add error notification
  const addErrorNotification = useCallback((message: string) => {
    addNotification({
      type: 'error',
      title: 'Error',
      message,
      autoHide: false // Errors should be manually dismissed
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    addAchievementNotification,
    addLeaderboardNotification,
    addSuccessNotification,
    addErrorNotification
  };
};
