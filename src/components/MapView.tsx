import { useRef, useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  description?: string;
}

interface MapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
}

export default function MapView({ locations, center = [78.9629, 20.5937], zoom = 5 }: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<Location | null>(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (locations.length > 0 && mapRef.current) {
      // If locations provided, automatically center to first location
      const firstLocation = locations[0];
      center = [firstLocation.lng, firstLocation.lat];
      zoom = 12;
    }
  }, [locations]);

  // Mock Mapbox access token (would come from env in a real app)
  const MAPBOX_TOKEN = 'pk.mock.token';

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200">
      {/* For demo, we'll just show a placeholder instead of the actual map */}
      <div className="bg-blue-50 h-full w-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="flex justify-center mb-2">
            <MapPin size={24} className="text-primary-600" />
          </div>
          <h3 className="font-medium text-gray-900">Map View</h3>
          <p className="text-gray-500 text-sm">
            {locations.length === 0 
              ? 'No locations to display' 
              : `${locations.length} location(s) would be shown here`}
          </p>
          {locations.length > 0 && (
            <div className="mt-2 text-xs text-left bg-white p-2 rounded-md">
              {locations.map((loc, index) => (
                <div key={index} className="mb-1 last:mb-0">
                  <span className="font-medium">Location {index + 1}:</span> {loc.description || `(${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
