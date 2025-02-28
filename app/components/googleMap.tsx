'use client';

import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MapPinpoint02Icon } from '@hugeicons-pro/core-twotone-rounded';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

export default function GoogleMapComponent({ lat, lng }: { lat?: number; lng?: number }) {
  const [isReady, setIsReady] = useState(false);
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      setIsReady(true);
    }
  }, [lat, lng]);

  if (!isReady) {
    return <p className="text-center text-gray-500">Waiting for location...</p>;
  }

  return (
    <LoadScript googleMapsApiKey={API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={{ lat, lng }} zoom={18}>
        <OverlayView position={{ lat, lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
          <div className="absolute flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-red-600 bg-opacity-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
              <HugeiconsIcon icon={MapPinpoint02Icon} className="text-white" size={40} />
            </div>
          </div>
        </OverlayView>
      </GoogleMap>
    </LoadScript>
  );
}
