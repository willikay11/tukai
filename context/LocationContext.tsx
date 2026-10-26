'use client';

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  /**
   * The Google place id of the reverse-geocoded point, from the same
   * geocoding call that resolves `city`/`area`. A community created without
   * asking the reader for a city (the create-community drawer) sends this as
   * its `google_map_place_id` instead.
   */
  placeId?: string;
  /** The reader's own city. Fixed for now - see the location handoff's open questions. */
  homeCity: string;
  /**
   * A city other than home, with location off. The city chip is just the
   * one thing this drives - see the location bar handoff.
   */
  away: boolean;
  /** Back to the home city, off location, as the chip's own home button does. */
  goHome: () => void;
  /** The one toast the location bar shows at a time, or none. */
  locationToast: string | null;
  /** Puts up a toast for 4.2s, replacing whichever one is already showing. */
  showLocationToast: (message: string) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'user_location';

// The reader's own city. Not yet editable - see the location handoff's open
// question on where that would live.
const HOME_CITY = 'Nairobi';

const TOAST_DURATION_MS = 4200;

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<LocationState['status']>('idle');
  const [city, setCity] = useState<string | undefined>(undefined);
  const [area, setArea] = useState<string | undefined>(undefined);
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Guards a geolocation call in flight: bumped whenever one is cancelled, so
  // a result that arrives after the reader picked a city or went home is
  // simply dropped rather than reopening "near me" behind their back.
  const requestTokenRef = useRef(0);
  // Whether the "Location on" toast is still owed once the city resolves -
  // set the moment the switch is turned on, so a slow reverse geocode still
  // ends in the toast the reader was told to expect.
  const toastPendingRef = useRef(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showLocationToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setLocationToast(message);
    toastTimeoutRef.current = setTimeout(() => setLocationToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    },
    [],
  );

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

  const persistUsing = (on: boolean) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, using: on }));
    } catch {
      // Storage can be refused; the preference still holds for this session
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

    const requestId = ++requestTokenRef.current;
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestTokenRef.current !== requestId) return; // cancelled since
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setStatus('granted');
        save(latitude, longitude, 'granted');
      },
      (error) => {
        if (requestTokenRef.current !== requestId) return; // cancelled since
        if (error.code === error.PERMISSION_DENIED) setStatus('denied');
        else setStatus('unavailable');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  };

  /** Drops a geolocation call in flight - picking a city or going home does. */
  const cancelPendingLocationRequest = () => {
    requestTokenRef.current += 1;
    setStatus((current) => (current === 'loading' ? 'idle' : current));
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

        const resolvedArea = [neighbourhood, locality].filter(Boolean).join(', ') || undefined;

        if (locality) setCity(locality);
        setArea(resolvedArea);
        setPlaceId(data?.results?.[0]?.place_id);

        if (toastPendingRef.current) {
          toastPendingRef.current = false;
          showLocationToast(
            `Location on. Closest first, around ${resolvedArea ?? locality ?? 'you'}.`,
          );
        }
      } catch (error) {
        // A city we cannot resolve is a label that stays as it was, not a
        // failure worth showing anyone
        console.error('Could not resolve the city:', error);

        if (toastPendingRef.current) {
          toastPendingRef.current = false;
          showLocationToast('Location on. Closest first.');
        }
      }
    };

    resolveCity();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, status, showLocationToast]);

  /**
   * Asking for the reader's location, or stepping back off it.
   *
   * Turning it off keeps the permission and the coordinates - there is nothing
   * to give back - and simply stops sorting by them. The "Location off" toast
   * is the caller's to show, not this function's - picking a city turns
   * location off the same way, and that one shows no toast at all.
   */
  const setUsingLocation = (on: boolean) => {
    setIsUsingLocation(on);
    persistUsing(on);

    if (!on) {
      toastPendingRef.current = false;
      cancelPendingLocationRequest();
      return;
    }

    if (status === 'granted') {
      showLocationToast(`Location on. Closest first, around ${area ?? city ?? 'you'}.`);
    } else {
      toastPendingRef.current = true;
      requestLocation();
    }
  };

  // A city other than home, with location off - the chip's "away" look and
  // the "Exploring" bar both key off this. Location on counts as home, even
  // while the city it found is still being named.
  const away = !isUsingLocation && !!city && city !== HOME_CITY;

  /** Back to the home city, off location - the chip's home button. */
  const goHome = () => {
    toastPendingRef.current = false;
    cancelPendingLocationRequest();
    setIsUsingLocation(false);
    persistUsing(false);
    setCity(HOME_CITY);
    showLocationToast(`Back to ${HOME_CITY}.`);
  };

  return (
    <LocationContext.Provider
      value={{
        lat,
        lng,
        status,
        city,
        area,
        placeId,
        isUsingLocation,
        setUsingLocation,
        setCity,
        requestLocation,
        setLocation,
        homeCity: HOME_CITY,
        away,
        goHome,
        locationToast,
        showLocationToast,
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
