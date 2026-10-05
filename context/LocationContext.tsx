'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

type LocationState = {
  lat?: number;
  lng?: number;
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';
};

type LocationContextType = LocationState & {
  /**
   * Whether the reader asked to be sorted by where they are.
   *
   * Held apart from `status`: a page cannot un-grant a permission, so deriving
   * this from `status` left a switch that could be turned on and never off.
   */
  isUsingLocation: boolean;
  /**
   * Turns that preference on or off, asking for permission the first time.
   * Deliberately not named `use…`: it is a setter, and the hooks lint rule
   * reads that prefix as a hook wherever it is called.
   */
  setUsingLocation: (on: boolean) => void;
  /** "Westlands, Nairobi" - the reader's own location, once resolved. */
  area?: string;
  // Reverse-geocoded city name. Resolved here rather than by whichever
  // component happened to be on screen: the search bar names the city, and it
  // cannot be the thing that fetches it.
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
  const [area, setArea] = useState<string | undefined>(undefined);
  const [isUsingLocation, setIsUsingLocation] = useState(false);

  const save = (lat?: number, lng?: number, st?: LocationState['status']) => {
    if (lat !== undefined && lng !== undefined) {
      const payload = { lat, lng, status: st ?? 'granted', using: true };
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

    setStatus('loading');
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
          setIsUsingLocation(parsed.using !== false);
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    // Do not auto-request location here; the UI should prompt the user first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Turn the coordinates into a city once they land. This used to live in
  // UserLocation, so the city only resolved while that chip was mounted.
  useEffect(() => {
    if (status !== 'granted' || !lat || !lng) return;

    let cancelled = false;

    const resolveCity = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        );
        const data = await response.json();
        const components = data?.results?.[0]?.address_components ?? [];

        const named = (type: string) =>
          components.find((part: { types: string[] }) => part.types.includes(type))?.long_name;

        const locality = named('locality');
        // The neighbourhood is what makes "where I am" read as a place rather
        // than as a city the reader already knew they were in
        const neighbourhood = named('sublocality') ?? named('neighborhood');

        if (cancelled) return;

        if (locality) setCity(locality);
        setArea([neighbourhood, locality].filter(Boolean).join(', ') || undefined);
      } catch (error) {
        // A city we cannot resolve is a label that stays as it was, not a
        // failure worth showing anyone
        console.error('Could not resolve the city:', error);
      }
    };

    resolveCity();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, status]);

  /**
   * Asking for the reader's location, or stepping back off it.
   *
   * Turning it off keeps the permission and the coordinates - there is nothing
   * to give back - and simply stops sorting by them.
   */
  const setUsingLocation = (on: boolean) => {
    setIsUsingLocation(on);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, using: on }));
    } catch {
      // Storage can be refused; the preference still holds for this session
    }

    if (on && status !== 'granted') requestLocation();
  };

  return (
    <LocationContext.Provider
      value={{
        lat,
        lng,
        status,
        city,
        area,
        isUsingLocation,
        setUsingLocation,
        setCity,
        requestLocation,
        setLocation,
      }}
    >
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
