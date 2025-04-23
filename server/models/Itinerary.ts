import mongoose from 'mongoose';

export interface IItinerary {
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
  days: Array<{
    day: number;
    waypoint: {
      lat: number;
      lon: number;
    };
    activity: {
      name: string;
      type: string;
      lat: number;
      lon: number;
    };
    lunch: {
      name: string;
      type: string;
      lat: number;
      lon: number;
    };
    hotel: {
      name: string;
      lat: number;
      lon: number;
      eco_rating: number;
    };
  }>;
  createdAt: Date;
}

const ItinerarySchema = new mongoose.Schema<IItinerary>({
  source: {
    city: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  destination: {
    city: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  totalDistance: { type: Number, required: true },
  days: [{
    day: { type: Number, required: true },
    waypoint: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    },
    activity: {
      name: { type: String, required: true },
      type: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    },
    lunch: {
      name: { type: String, required: true },
      type: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    },
    hotel: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
      eco_rating: { type: Number, required: true }
    }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Itinerary = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);

export { Itinerary }; 