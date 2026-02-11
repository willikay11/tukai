'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';

import IconComponent from './iconComponent';

export default function UserLocation() {
  const { lat, lng, status, requestLocation } = useLocation();
  const [address, setAddress] = useState<string>('Embakasi, Nairobi');
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);

  useEffect(() => {
    if (status === 'granted' && lat && lng) {
      const fetchAddress = async () => {
        setIsLoadingAddress(true);
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            // Try to find locality (neighborhood/suburb) and administrative area (city)
            const result = data.results[0];
            let locality = '';
            let city = '';

            for (const component of result.address_components) {
              if (
                component.types.includes('sublocality') ||
                component.types.includes('neighborhood')
              ) {
                locality = component.long_name;
              }
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
            }

            if (locality && city) {
              setAddress(`${locality}, ${city}`);
            } else if (city) {
              setAddress(city);
            } else {
              // Fallback to formatted address shortened
              const parts = result.formatted_address.split(',');
              setAddress(parts.slice(0, 2).join(','));
            }
          }
        } catch (error) {
          console.error('Error fetching address:', error);
        } finally {
          setIsLoadingAddress(false);
        }
      };

      fetchAddress();
    }
  }, [lat, lng, status]);

  return (
    <div className="flex items-center gap-1 rounded-[30px] bg-green-200 px-4 py-1 text-green-800 mt-4">
      <IconComponent iconName="LocationIcon" size={16} />
      <span className="max-w-[100px] truncate whitespace-nowrap text-xs font-semibold p-0">
        {isLoadingAddress || status === 'idle' ? 'Loading location ...' : address}
      </span>
      <div className="mx-2 h-1 w-1 rounded-full bg-green-600" />
      <Button
        variant="link"
        className="p-0 hover:no-underline h-fit"
        onClick={requestLocation}
        disabled={status === 'idle' || isLoadingAddress}
      >
        <IconComponent
          iconName="ReloadIcon"
          size={16}
          className={isLoadingAddress || status === 'idle' ? 'animate-spin' : ''}
        />
        Update Location
      </Button>
    </div>
  );
}
