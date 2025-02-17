'use client';

import React, { createContext, ReactNode, useState } from 'react';
import Notification from '@/app/components/Notification';

export type INotification = {
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
  timeout?: number;
};

export const NotificationContext = createContext({});

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<any[]>([]);

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

  const close = (id: number) => setToasts((toasts) => toasts.filter((toast) => toast.id !== id));

  return (
    <NotificationContext.Provider value={{ open, close }}>
      {children}
      <div className="right-2 top-6" style={{ position: 'fixed' }}>
        {toasts.map(({ id, type, title, message }) => (
          <div className="mb-2" key={id}>
            <Notification type={type} title={title} message={message} onClose={() => close(id)} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
