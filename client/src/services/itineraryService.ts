import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export interface ItineraryRequest {
  sourceCity: string;
  destinationCity: string;
  numberOfDays: number;
}

export interface POI {
  name: string;
  type: string;
  lat: number;
  lon: number;
  eco_rating?: number;
}

export interface DayPlan {
  day: number;
  waypoint: {
    lat: number;
    lon: number;
  };
  activity: POI;
  lunch: POI;
  hotel: POI;
}

export interface ItineraryResponse {
  _id: string;
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
  totalDistance: number;
  days: DayPlan[];
}

export const createItinerary = async (data: ItineraryRequest): Promise<ItineraryResponse> => {
  const response = await axios.post(`${API_BASE_URL}/itinerary`, data);
  return response.data;
};

export const getItineraries = async (): Promise<ItineraryResponse[]> => {
  const response = await axios.get(`${API_BASE_URL}/itinerary`);
  return response.data;
};

export const getItinerary = async (id: string): Promise<ItineraryResponse> => {
  const response = await axios.get(`${API_BASE_URL}/itinerary/${id}`);
  return response.data;
};

export const exportToPDF = async (itinerary: ItineraryResponse): Promise<Blob> => {
  const response = await axios.post(`${API_BASE_URL}/itinerary/export`, itinerary, {
    responseType: 'blob'
  });
  return response.data;
}; 