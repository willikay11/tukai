'use client';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

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
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </LoadScript>
  );
}
