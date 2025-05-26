
"use client";

import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '350px', // Adjusted height for map container
  borderRadius: '0.5rem',
};

// Default center (Santo Domingo, DR)
const defaultCenter = {
  lat: 18.4861,
  lng: -69.9312,
};

const libraries = ['places'] as any; 

interface RestaurantLocationMapProps {
  apiKey: string;
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  setMapManuallyClosed?: Dispatch<SetStateAction<boolean>>; 
}

export default function RestaurantLocationMap({
  apiKey,
  initialLat,
  initialLng,
  onLocationSelect,
  setMapManuallyClosed,
}: RestaurantLocationMapProps) {
  const [markerPosition, setMarkerPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter
  );
  const [mapCenter, setMapCenter] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter
  );
  const [searchAddress, setSearchAddress] = useState('');
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const mapRef = React.useRef<google.maps.Map | null>(null);
  const geocoderRef = React.useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    // console.log("Google Maps API Key being used by RestaurantLocationMap:", apiKey ? apiKey.substring(0, 10) + "..." : "API Key is empty");
  }, [apiKey]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    if (initialLat !== undefined && initialLng !== undefined && initialLat !== null && initialLng !== null) {
        const initialPos = { lat: initialLat, lng: initialLng };
        map.setCenter(initialPos);
        setMarkerPosition(initialPos); // Set marker if initial values are present
    }
  }, [initialLat, initialLng]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(newPos);
    }
  }, []);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(newPos);
    }
  }, []);
  
  const handleConfirmLocation = async () => {
    if (!markerPosition || !geocoderRef.current) return;
    setIsGeocoding(true);
    setGeocodingError(null);
    let address = `Lat: ${markerPosition.lat.toFixed(4)}, Lng: ${markerPosition.lng.toFixed(4)}`; // Fallback address
    try {
      const response = await geocoderRef.current.geocode({ location: markerPosition });
      if (response && response.results[0]) {
        address = response.results[0].formatted_address;
      } else {
         setGeocodingError('No se pudo obtener la dirección para esta ubicación. Se usará Lat/Lng como dirección.');
      }
      onLocationSelect({ lat: markerPosition.lat, lng: markerPosition.lng, address });
      if (setMapManuallyClosed) setMapManuallyClosed(false); 
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setGeocodingError('Error al obtener la dirección. Intenta de nuevo. Se usará Lat/Lng como dirección.');
      onLocationSelect({ lat: markerPosition.lat, lng: markerPosition.lng, address }); // Pass fallback address
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchAddress || !geocoderRef.current) return;
    setIsGeocoding(true);
    setGeocodingError(null);
    try {
      const response = await geocoderRef.current.geocode({ address: searchAddress });
      if (response && response.results[0] && response.results[0].geometry) {
        const location = response.results[0].geometry.location;
        const newPos = { lat: location.lat(), lng: location.lng() };
        setMarkerPosition(newPos);
        setMapCenter(newPos);
        if(mapRef.current) mapRef.current.panTo(newPos);
      } else {
        setGeocodingError('Dirección no encontrada. Intenta ser más específico.');
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      setGeocodingError('Error al buscar la dirección. Intenta de nuevo.');
    } finally {
      setIsGeocoding(false);
    }
  };
  
  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
  }), []);

  return (
    <LoadScriptNext
      googleMapsApiKey={apiKey}
      libraries={libraries}
      loadingElement={<div className="flex items-center justify-center h-[350px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Cargando mapa...</p></div>}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Buscar dirección o lugar..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearchAddress(); }}
            className="flex-grow"
          />
          <Button onClick={handleSearchAddress} disabled={isGeocoding || !searchAddress}>
            {isGeocoding && searchAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Buscar
          </Button>
        </div>
         {geocodingError && <p className="text-sm text-destructive">{geocodingError}</p>}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={initialLat !== undefined && initialLng !== undefined && initialLat !== null && initialLng !== null ? 15 : 13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
          options={mapOptions}
        >
          {markerPosition && (
            <Marker 
              position={markerPosition} 
              draggable={true}
              onDragEnd={onMarkerDragEnd}
            />
          )}
        </GoogleMap>
        <div className="text-xs text-muted-foreground">
          Haz clic en el mapa para colocar el marcador o arrástralo a la ubicación exacta de tu restaurante.
        </div>
        <div className="flex justify-end gap-2">
           {setMapManuallyClosed && (
             <Button variant="outline" onClick={() => setMapManuallyClosed(false)}>Cancelar</Button>
           )}
          <Button onClick={handleConfirmLocation} disabled={isGeocoding}>
            {isGeocoding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar Ubicación
          </Button>
        </div>
      </div>
    </LoadScriptNext>
  );
}


    