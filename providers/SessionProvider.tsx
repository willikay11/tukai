'use client';

import React, { ReactNode, createContext, useEffect, useState } from 'react';

import { SessionProvider as SProvider } from 'next-auth/react';

export const SessionContext = createContext({});

export default function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<
    { id: string; firstName: string; lastName: string; email: string } | undefined
  >();

  const fetchUserProfile = async () => {
    const response = await fetch('/auth/profile/api', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      setUser(undefined);
    }

    const data = await response.json();
    setUser(data.data);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <SessionContext.Provider value={{ user, setUser }}>
      <SProvider>{children}</SProvider>
    </SessionContext.Provider>
  );
}
