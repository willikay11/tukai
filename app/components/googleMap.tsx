'use client';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 37.7749, // San Francisco Latitude
  lng: -122.4194, // San Francisco Longitude
};

export default function GoogleMapComponent() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''; // Use an environment variable

  return (
    <LoadScript googleMapsApiKey={API_KEY} onLoad={() => setMapLoaded(true)}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {mapLoaded && <Marker position={center} />}
      </GoogleMap>
    </LoadScript>
  );
}
