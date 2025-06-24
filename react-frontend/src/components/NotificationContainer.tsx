// Notification container component

import React from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import Notification from './Notification';
import '../styles/NotificationContainer.css';

const NotificationContainer: React.FC = () => {
  const { notifications } = useNotificationContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification 
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
