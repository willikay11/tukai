'use client';

import React, { createContext, useState } from 'react';
import Notification from '@/app/ui/Notification';

export const NotificationContext = createContext({});

export default function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const open = (
    type: 'success' | 'info' | 'error',
    title: string,
    message: string,
    timeout = 5000,
  ) => {
    const id = Date.now();
    setToasts((toasts) => [...toasts, { id, type, title, message }]);

    setTimeout(() => close(id), timeout);

    return id;
  };

  const close = (id) => setToasts((toasts) => toasts.filter((toast) => toast.id !== id));

  return (
    <NotificationContext.Provider value={{ open, close }}>
      {children}
      <div className="absolute right-2 top-6">
        {toasts.map(({ id, type, title, message }) => (
          <div className="mb-2" key={id}>
            <Notification type={type} title={title} message={message} onClose={() => close(id)} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
