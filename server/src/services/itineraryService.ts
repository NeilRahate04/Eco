import axios from 'axios';
import { haversineDistance } from '../utils/geoUtils';

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

interface OverpassResponse {
  elements: Array<{
    id: number;
    type: string;
    lat: number;
    lon: number;
    tags: {
      name: string;
      tourism?: string;
      leisure?: string;
      amenity?: string;
      eco_rating?: string;
      diet_vegan?: string;
    };
  }>;
}

export interface ItineraryRequest {
  sourceCity: string;
  destinationCity: string;
  numberOfDays: number;
}

export interface POI {
  id: string;
  name: string;
  type: 'eco_lodge' | 'nature_reserve' | 'restaurant';
  latitude: number;
  longitude: number;
  eco_rating?: number;
}

export interface DayPlan {
  day: number;
  pois: POI[];
}

export interface ItineraryResponse {
  source: {
    city: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    city: string;
    latitude: number;
    longitude: number;
  };
  days: DayPlan[];
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

async function getCoordinates(city: string): Promise<{ lat: number; lon: number; name: string }> {
  const response = await axios.get<NominatimResponse[]>(NOMINATIM_URL, {
    params: {
      q: city,
      format: 'json',
      limit: 1
    }
  });

  if (response.data.length === 0) {
    throw new Error(`Could not find coordinates for city: ${city}`);
  }

  return {
    lat: parseFloat(response.data[0].lat),
    lon: parseFloat(response.data[0].lon),
    name: response.data[0].display_name
  };
}

async function getPOIs(lat: number, lon: number, radius: number = 5000): Promise<POI[]> {
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["tourism"="hotel"]["eco_rating"](around:${radius},${lat},${lon});
      node["leisure"="nature_reserve"](around:${radius},${lat},${lon});
      node["amenity"="restaurant"]["diet:vegan"="yes"](around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  const response = await axios.post<OverpassResponse>(OVERPASS_URL, overpassQuery);

  return response.data.elements
    .map(element => {
      let type: POI['type'] | null = null;
      let eco_rating: number | undefined;

      if (element.tags.tourism === 'hotel' && element.tags.eco_rating) {
        type = 'eco_lodge';
        eco_rating = parseFloat(element.tags.eco_rating);
      } else if (element.tags.leisure === 'nature_reserve') {
        type = 'nature_reserve';
      } else if (element.tags.amenity === 'restaurant' && element.tags.diet_vegan === 'yes') {
        type = 'restaurant';
      }

      if (!type) return null;

      return {
        id: element.id.toString(),
        name: element.tags.name || 'Unnamed Location',
        type,
        latitude: element.lat,
        longitude: element.lon,
        eco_rating
      };
    })
    .filter((poi): poi is POI => poi !== null);
}

function calculateMidpoints(source: { lat: number; lon: number }, destination: { lat: number; lon: number }, numberOfDays: number): Array<{ lat: number; lon: number }> {
  const midpoints: Array<{ lat: number; lon: number }> = [];
  const latStep = (destination.lat - source.lat) / (numberOfDays + 1);
  const lonStep = (destination.lon - source.lon) / (numberOfDays + 1);

  for (let i = 1; i <= numberOfDays; i++) {
    midpoints.push({
      lat: source.lat + latStep * i,
      lon: source.lon + lonStep * i
    });
  }

  return midpoints;
}

export async function generateItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
  const source = await getCoordinates(request.sourceCity);
  const destination = await getCoordinates(request.destinationCity);

  const midpoints = calculateMidpoints(source, destination, request.numberOfDays);
  const days: DayPlan[] = [];

  for (let i = 0; i < request.numberOfDays; i++) {
    const pois = await getPOIs(midpoints[i].lat, midpoints[i].lon);
    // Sort POIs by eco_rating (if applicable) and take top 3
    const sortedPOIs = pois.sort((a, b) => {
      if (a.type === 'eco_lodge' && b.type === 'eco_lodge') {
        return (b.eco_rating || 0) - (a.eco_rating || 0);
      }
      return 0;
    }).slice(0, 3);

    days.push({
      day: i + 1,
      pois: sortedPOIs
    });
  }

  return {
    source: {
      city: source.name,
      latitude: source.lat,
      longitude: source.lon
    },
    destination: {
      city: destination.name,
      latitude: destination.lat,
      longitude: destination.lon
    },
    days
  };
} 