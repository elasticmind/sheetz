import React, { useImperativeHandle, useState, forwardRef } from 'react';

export const Notifications = forwardRef(({ max = 3 }, ref) => {
  const [notifications, setNotifications] = useState([]);

  useImperativeHandle(ref, () => ({
    add: (text = 'Something bad has happened! :\\') => {
      setNotifications((oldNotifications) => {
        const remainingOldNotifications = oldNotifications.slice(0, max - 1);
        return [...remainingOldNotifications, text];
      });
    }
  }));

  const handleNotificationClose = (index) => () => {
    setNotifications((oldNotifications) => oldNotifications.filter((oldNotification, oldIndex) => oldIndex !== index));
  }

  return (
    <div style={{ position: 'fixed', bottom: '0', right: '0' }} className="mr-4 mb-4">
      {notifications.map((notification, index) => (
        <div className="notification is-danger" key={notification + index}>
          <button className="delete" onClick={handleNotificationClose(index)}></button>
          {notification}
        </div>
      ))}
    </div>
  );
});
