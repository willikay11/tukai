'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

type LocationState = {
  lat?: number;
  lng?: number;
  status: 'idle' | 'granted' | 'denied' | 'unavailable';
};

type LocationContextType = LocationState & {
  // Reverse-geocoded city name, populated by UserLocation once resolved
  city?: string;
  setCity: (city: string) => void;
  requestLocation: () => void;
  setLocation: (lat: number, lng: number) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'user_location';

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<LocationState['status']>('idle');
  const [city, setCity] = useState<string | undefined>(undefined);

  const save = (lat?: number, lng?: number, st?: LocationState['status']) => {
    if (lat !== undefined && lng !== undefined) {
      const payload = { lat, lng, status: st ?? 'granted' };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        // ignore
      }
    }
  };

  const setLocation = (nlat: number, nlng: number) => {
    setLat(nlat);
    setLng(nlng);
    setStatus('granted');
    save(nlat, nlng, 'granted');
  };

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('idle');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setStatus('granted');
        save(latitude, longitude, 'granted');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setStatus('denied');
        else setStatus('unavailable');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  };

  useEffect(() => {
    // Try to load saved location first
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.lat && parsed?.lng) {
          setLat(parsed.lat);
          setLng(parsed.lng);
          setStatus(parsed.status ?? 'granted');
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    // Do not auto-request location here; the UI should prompt the user first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocationContext.Provider value={{ lat, lng, status, city, setCity, requestLocation, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider');
  return ctx;
};

export default LocationContext;
