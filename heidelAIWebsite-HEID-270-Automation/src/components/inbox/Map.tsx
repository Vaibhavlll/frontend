import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { Card } from '../ui/card';
import { Button } from '@mui/material';

// Define types
interface LocationState {
  loaded: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  error: boolean;
}

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface MapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

// Dynamically import Leaflet to avoid SSR issues
const MapComponent: React.FC<{
  center: { lat: number; lng: number };
  location: LocationState;
  zoomLevel: number;
}> = ({ center, location, zoomLevel }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Fix icon paths issue by redefining the default icon
    delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
    });

    // Initialize map if container exists and map doesn't
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Create map instance
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoomLevel);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Map</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array as we only want to initialize once

  // Update view when center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoomLevel);
    }
  }, [center, zoomLevel]);

  // Handle marker updates
  useEffect(() => {
    // Skip if map isn't initialized
    if (!mapInstanceRef.current) return;
    
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    
    // Add marker if location is loaded
    if (location.loaded && !location.error) {
      // Create a custom icon to ensure visibility
      const customIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });
      
      markerRef.current = L.marker(
        [location.coordinates.lat, location.coordinates.lng],
        { icon: customIcon }
      ).addTo(mapInstanceRef.current);
      
      // Add a popup to the marker with coordinates
      markerRef.current.bindPopup(
        `<b>Location</b><br>Lat: ${location.coordinates.lat.toFixed(5)}<br>Lng: ${location.coordinates.lng.toFixed(5)}`
      ).openPopup();
    }
  }, [location]);

  return <div ref={mapContainerRef} style={{ height: "400px", width: "100%" }}></div>;
};

// Dynamically load the map component with no SSR
const DynamicMap = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false
});

const Map:  NextPage<MapProps> = ({ onLocationSelect }) => {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: -4.043477, lng: 39.668205 });
  const [location, setLocation] = useState<LocationState>({ 
    loaded: false, 
    coordinates: { lat: 0, lng: 0 }, 
    error: false 
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const ZOOM_LEVEL = 7; // Increased zoom level for better visibility

  

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation({
            loaded: true,
            coordinates: newPosition,
            error: false,
          });
          setCenter(newPosition);
        },
        () => {
          setLocation((prev) => ({ ...prev, error: true }));
        }
      );
    }
  }, []);

  // Handle location search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      if (data.length === 0) {
        alert("No locations found. Please try a different search term.");
        setIsSearching(false);
        return;
      }
      
      setSearchResults(data.map((item: { lat: string; lon: string; display_name: string }) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name
      })));
      
      // If we have results, immediately use the first one
      if (data.length === 1) {
        handleSelectLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      alert("Error searching for location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a search result
  const handleSelectLocation = (result: SearchResult) => {
    const newPosition = { lat: result.lat, lng: result.lng };
    
    setCenter(newPosition);
    setLocation({
      loaded: true,
      coordinates: newPosition,
      error: false
    });
    
    setSearchResults([]);
    setSearchQuery('');
    
    // Call the callback function with the selected location data
    onLocationSelect({ lat: result.lat, lng: result.lng, address: result.display_name });
  };


return (
  <div className="container mt-4">
    <div className="row mb-4">
      <div className="col-12">
        <form onSubmit={handleSearch} className="input-group">
          <input
            type="text"
            className="form-control outline-none m-2 p-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            aria-label="Search for a location"
          />
          <Button variant="contained" color="primary" type="submit" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
         
        </form>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="list-group mt-3">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectLocation(result)}
              >
                {result.display_name}
                <small className="d-block text-muted">
                  Lat: {result.lat.toFixed(5)}, Lng: {result.lng.toFixed(5)}
                </small>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    
    <div className="row">
      <div className="col-12">
        <Card>
          <div className="card-body p-0">
            {typeof window !== 'undefined' && (
              <DynamicMap 
                center={center} 
                location={location} 
                zoomLevel={ZOOM_LEVEL} 
              />
            )}
          </div>
          {location.loaded && !location.error && (
            <div className="card-footer text-center">
              <small className="text-muted">
                Current Location: Latitude {location.coordinates.lat.toFixed(5)}, 
                Longitude {location.coordinates.lng.toFixed(5)}
              </small>
            </div>
          )}  
        </Card>
      </div>
    </div>
  </div>
)
};

export default Map;