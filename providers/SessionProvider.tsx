'use client';

import React, { createContext, useEffect, useState } from 'react';

export const SessionContext = createContext(undefined);

export default function SessionProvider({ children }) {
  const [user, setUser] = useState<{ firstName: string; lastName: string } | undefined>();

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

  return <SessionContext.Provider value={{ user, setUser }}>{children}</SessionContext.Provider>;
}
