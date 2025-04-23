import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createItinerary, type ItineraryResponse, type DayPlan } from '../services/itineraryService';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ecoLodgeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const natureReserveIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ItineraryPlanner: React.FC = () => {
  const [formData, setFormData] = useState({
    sourceCity: '',
    destinationCity: '',
    numberOfDays: 1,
  });
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createItinerary(formData);
      setItinerary(response);
    } catch (err) {
      setError('Failed to create itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIconForPOI = (type: string) => {
    const iconUrl = type === 'nature_reserve'
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
      : type === 'restaurant'
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';

    return new L.Icon({
      iconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Eco-Friendly Itinerary Planner</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Source City</label>
            <input
              type="text"
              value={formData.sourceCity}
              onChange={(e) => setFormData({ ...formData, sourceCity: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Destination City</label>
            <input
              type="text"
              value={formData.destinationCity}
              onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Days</label>
            <input
              type="number"
              min="1"
              value={formData.numberOfDays}
              onChange={(e) => setFormData({ ...formData, numberOfDays: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating Itinerary...' : 'Create Itinerary'}
        </button>
      </form>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {itinerary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="h-[600px]">
            {mapReady && (
              <MapContainer
                center={[
                  (itinerary.source.latitude + itinerary.destination.latitude) / 2,
                  (itinerary.source.longitude + itinerary.destination.longitude) / 2
                ]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Source marker */}
                <Marker
                  position={[itinerary.source.latitude, itinerary.source.longitude]}
                  icon={new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                >
                  <Popup>
                    <div>
                      <h3 className="font-medium">Start: {itinerary.source.city}</h3>
                    </div>
                  </Popup>
                </Marker>
                {/* Destination marker */}
                <Marker
                  position={[itinerary.destination.latitude, itinerary.destination.longitude]}
                  icon={new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                >
                  <Popup>
                    <div>
                      <h3 className="font-medium">Destination: {itinerary.destination.city}</h3>
                    </div>
                  </Popup>
                </Marker>
                {/* Waypoints and POIs */}
                {itinerary.days.map((dayPlan) => (
                  <React.Fragment key={dayPlan.day}>
                    {/* Waypoint marker */}
                    <Marker
                      position={[dayPlan.waypoint.lat, dayPlan.waypoint.lon]}
                      icon={new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                      })}
                    >
                      <Popup>
                        <div>
                          <h3 className="font-medium">Day {dayPlan.day} Waypoint</h3>
                        </div>
                      </Popup>
                    </Marker>
                    {/* Activity marker */}
                    {dayPlan.activity && (
                      <Marker
                        position={[dayPlan.activity.lat, dayPlan.activity.lon]}
                        icon={getIconForPOI(dayPlan.activity.type)}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-medium">{dayPlan.activity.name}</h3>
                            <p className="text-sm">Activity</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {/* Lunch marker */}
                    {dayPlan.lunch && (
                      <Marker
                        position={[dayPlan.lunch.lat, dayPlan.lunch.lon]}
                        icon={getIconForPOI(dayPlan.lunch.type)}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-medium">{dayPlan.lunch.name}</h3>
                            <p className="text-sm">Lunch</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {/* Hotel marker */}
                    {dayPlan.hotel && (
                      <Marker
                        position={[dayPlan.hotel.lat, dayPlan.hotel.lon]}
                        icon={getIconForPOI('hotel')}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-medium">{dayPlan.hotel.name}</h3>
                            <p className="text-sm">Hotel (Eco Rating: {dayPlan.hotel.eco_rating}/5)</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                ))}
                {/* Route line */}
                <Polyline
                  positions={[
                    [itinerary.source.latitude, itinerary.source.longitude] as [number, number],
                    ...itinerary.days.map(day => [day.waypoint.lat, day.waypoint.lon] as [number, number]),
                    [itinerary.destination.latitude, itinerary.destination.longitude] as [number, number]
                  ]}
                  color="blue"
                  weight={3}
                  opacity={0.7}
                />
              </MapContainer>
            )}
          </div>

          {/* Itinerary Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Your Eco-Friendly Itinerary</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Journey Details</h3>
                  <p>From: {itinerary.source.city}</p>
                  <p>To: {itinerary.destination.city}</p>
                  <p>Total Distance: {itinerary.totalDistance.toFixed(1)} km</p>
                </div>

                {itinerary.days.map((dayPlan) => (
                  <div key={dayPlan.day} className="border rounded-lg p-4">
                    <h3 className="text-xl font-medium mb-2">Day {dayPlan.day}</h3>
                    <div className="space-y-4">
                      {/* Activity */}
                      {dayPlan.activity && (
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium">Activity</h4>
                          <p>{dayPlan.activity.name}</p>
                          <p className="text-sm text-gray-600">Type: {dayPlan.activity.type}</p>
                        </div>
                      )}

                      {/* Lunch */}
                      {dayPlan.lunch && (
                        <div className="border-l-4 border-yellow-500 pl-4">
                          <h4 className="font-medium">Lunch</h4>
                          <p>{dayPlan.lunch.name}</p>
                          <p className="text-sm text-gray-600">Type: {dayPlan.lunch.type}</p>
                        </div>
                      )}

                      {/* Hotel */}
                      {dayPlan.hotel && (
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">Accommodation</h4>
                          <p>{dayPlan.hotel.name}</p>
                          <p className="text-sm text-gray-600">
                            Eco Rating: {'★'.repeat(dayPlan.hotel.eco_rating)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setItinerary(null)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create New Itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryPlanner; 