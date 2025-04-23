import { IStorage } from './storage';
import User, { IUser } from './models/User';
import Destination, { IDestination } from './models/Destination';
import TransportOption, { ITransportOption } from './models/TransportOption';
import Trip, { ITrip } from './models/Trip';
import CarbonRecord, { ICarbonRecord } from './models/CarbonRecord';
import Listing, { IListing } from './models/Listing';
import Review, { IReview } from './models/Review';
import { Types } from 'mongoose';
import { 
  type UserPreferences,
  type InsertUser,
  type InsertDestination,
  type InsertTransportOption,
  type InsertTrip,
  type InsertCarbonRecord,
  type InsertListing,
  type InsertReview,
  type Register
} from "@shared/mongodb-schema";
import { Itinerary, IItinerary } from './models/Itinerary';
import bcrypt from 'bcryptjs';

export class MongoDBStorage implements IStorage {
  public sessionStore: any;
  private sessions: Map<string, any>;

  constructor() {
    this.sessions = new Map();
    
    // Create a simple in-memory session store
    this.sessionStore = {
      sessions: this.sessions,
      get: (sid: string) => Promise.resolve(this.sessions.get(sid)),
      set: (sid: string, session: any) => {
        this.sessions.set(sid, session);
        return Promise.resolve();
      },
      destroy: (sid: string) => {
        this.sessions.delete(sid);
        return Promise.resolve();
      },
      all: () => Promise.resolve(Array.from(this.sessions.values())),
      clear: () => {
        this.sessions.clear();
        return Promise.resolve();
      },
      length: () => Promise.resolve(this.sessions.size),
      touch: () => Promise.resolve()
    };

    this.initializeData();
  }

  private async initializeData() {
    try {
      const count = await TransportOption.countDocuments();
      if (count === 0) {
        await this.initializeTransportOptions();
        await this.initializeDestinations();
      }
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }

  private async initializeTransportOptions() {
    const options = [
      {
        name: "Train",
        type: "train",
        icon: "train",
        carbonPerKm: 20,
        carbonCategory: "low",
        colorClass: "success"
      },
      {
        name: "Bus",
        type: "bus",
        icon: "bus",
        carbonPerKm: 25,
        carbonCategory: "low",
        colorClass: "success"
      },
      {
        name: "Car (Shared)",
        type: "car",
        icon: "car-side",
        carbonPerKm: 45,
        carbonCategory: "medium",
        colorClass: "warning"
      },
      {
        name: "Flight",
        type: "plane",
        icon: "plane",
        carbonPerKm: 170,
        carbonCategory: "high",
        colorClass: "error"
      }
    ];

    await TransportOption.insertMany(options);
  }

  private async initializeDestinations() {
    const destinations = [
      {
        name: "Costa Rica",
        country: "Costa Rica",
        description: "Pioneer in ecotourism with rich biodiversity, rainforests, and sustainable practices.",
        image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 48,
        ecoCertified: true,
        carbonImpact: "Low Carbon Impact",
        carbonScore: 1
      },
      {
        name: "Norway",
        country: "Norway",
        description: "Stunning fjords and mountains with a commitment to renewable energy and conservation.",
        image_url: "https://images.unsplash.com/photo-1543161949-1f9193812ce8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 47,
        ecoCertified: true,
        carbonImpact: "Low Carbon Impact",
        carbonScore: 1
      }
    ];

    await Destination.insertMany(destinations);
  }

  // User operations
  async getUser(id: Types.ObjectId): Promise<IUser | undefined> {
    return await User.findById(id).exec() || undefined;
  }

  async getUserByUsername(username: string): Promise<IUser | undefined> {
    return await User.findOne({ username }).exec() || undefined;
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    return await User.findOne({ email }).exec() || undefined;
  }

  async createUser(userData: Register): Promise<IUser> {
    try {
      // Verify password match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user without confirmPassword
      const { confirmPassword, ...userDataWithoutConfirm } = userData;
      const user = new User({
        ...userDataWithoutConfirm,
        password: hashedPassword,
        preferences: {
          preferredTransportTypes: [],
          preferredDestinations: [],
          ecoMode: true,
          notificationsEnabled: true,
          theme: 'system'
        }
      });

      // Save user
      const savedUser = await user.save();
      console.log('User created successfully:', savedUser.username);
      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof Error) {
        // Handle mongoose duplicate key error
        if ((error as any).code === 11000) {
          const keyPattern = (error as any).keyPattern;
          if (keyPattern?.username) {
            throw new Error('Username already exists');
          }
          if (keyPattern?.email) {
            throw new Error('Email already exists');
          }
        }
        throw error;
      }
      throw new Error('Unknown error occurred while creating user');
    }
  }

  async updateUserPreferences(userId: Types.ObjectId, preferences: UserPreferences): Promise<IUser | undefined> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true }
    ).exec() || undefined;
  }

  // Destination operations
  async getDestinations(): Promise<IDestination[]> {
    return await Destination.find().exec();
  }

  async getDestination(id: Types.ObjectId): Promise<IDestination | undefined> {
    return await Destination.findById(id).exec() || undefined;
  }

  async createDestination(destination: InsertDestination): Promise<IDestination> {
    const newDestination = new Destination(destination);
    return await newDestination.save();
  }

  // Transport options operations
  async getTransportOptions(): Promise<ITransportOption[]> {
    return await TransportOption.find().exec();
  }

  async getTransportOption(id: Types.ObjectId): Promise<ITransportOption | undefined> {
    return await TransportOption.findById(id).exec() || undefined;
  }

  async createTransportOption(option: InsertTransportOption): Promise<ITransportOption> {
    const newOption = new TransportOption(option);
    return await newOption.save();
  }

  // Trip operations
  async getTrips(userId: Types.ObjectId): Promise<ITrip[]> {
    return await Trip.find({ userId }).exec();
  }

  async getTripsByDestination(destination: string): Promise<ITrip[]> {
    return await Trip.find({ toLocation: destination }).exec();
  }

  async getTrip(id: Types.ObjectId): Promise<ITrip | undefined> {
    return await Trip.findById(id).exec() || undefined;
  }

  async createTrip(trip: InsertTrip): Promise<ITrip> {
    const newTrip = new Trip(trip);
    return await newTrip.save();
  }

  async deleteTrip(id: Types.ObjectId): Promise<boolean> {
    const result = await Trip.findByIdAndDelete(id).exec();
    return !!result;
  }

  // Carbon footprint operations
  async calculateCarbonFootprint(fromLocation: string, toLocation: string, transportType: string, passengers: number): Promise<number> {
    const distance = await this.getEstimatedDistance(fromLocation, toLocation);
    const transport = await TransportOption.findOne({ type: transportType }).exec();
    if (!transport) return 0;
    return distance * transport.carbonPerKm * passengers;
  }

  private async getEstimatedDistance(from: string, to: string): Promise<number> {
    // Sample distances in kilometers
    const routes: { [key: string]: number } = {
      "san francisco-los angeles": 600,
      "los angeles-san francisco": 600,
      "new york-boston": 350,
      "boston-new york": 350,
      "london-paris": 450,
      "paris-london": 450,
      "tokyo-osaka": 500,
      "osaka-tokyo": 500,
    };
    
    const routeKey = `${from.toLowerCase()}-${to.toLowerCase()}`;
    return routes[routeKey] || 500; // Default to 500km if route not found
  }

  async getCarbonRecords(userId: Types.ObjectId): Promise<ICarbonRecord[]> {
    return await CarbonRecord.find({ userId }).exec();
  }

  async createCarbonRecord(record: InsertCarbonRecord): Promise<ICarbonRecord> {
    const newRecord = new CarbonRecord(record);
    return await newRecord.save();
  }

  // Listing operations
  async getListings(): Promise<IListing[]> {
    return await Listing.find().exec();
  }

  async getListing(id: Types.ObjectId): Promise<IListing | undefined> {
    return await Listing.findById(id).exec() || undefined;
  }

  async createListing(listing: InsertListing): Promise<IListing> {
    const newListing = new Listing(listing);
    return await newListing.save();
  }

  async updateListing(id: Types.ObjectId, listing: Partial<InsertListing>): Promise<IListing | undefined> {
    return await Listing.findByIdAndUpdate(
      id,
      { $set: listing },
      { new: true }
    ).exec() || undefined;
  }

  async deleteListing(id: Types.ObjectId): Promise<boolean> {
    const result = await Listing.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  // Review operations
  async getReviews(serviceType: string, serviceId: Types.ObjectId): Promise<IReview[]> {
    return await Review.find({ serviceType, serviceId }).exec();
  }

  async getReview(id: Types.ObjectId): Promise<IReview | undefined> {
    return await Review.findById(id).exec() || undefined;
  }

  async createReview(review: InsertReview): Promise<IReview> {
    const newReview = new Review(review);
    return await newReview.save();
  }

  async approveReview(id: Types.ObjectId): Promise<IReview | undefined> {
    return await Review.findByIdAndUpdate(
      id,
      { $set: { approved: true } },
      { new: true }
    ).exec() || undefined;
  }

  async getDestinationReviews(destination: string): Promise<IReview[]> {
    return await Review.find({ 
      serviceType: 'destination',
      serviceId: new Types.ObjectId(destination)
    }).exec();
  }

  private async geocodeCity(city: string): Promise<{ lat: number; lon: number }> {
    try {
      console.log(`Geocoding city: ${city}`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Geocoding response for ${city}:`, data);
      
      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
        console.log(`Found coordinates for ${city}:`, result);
        return result;
      }
      
      console.log(`No coordinates found for ${city}, using default`);
      return { lat: 0, lon: 0 };
    } catch (error) {
      console.error('Geocoding error for city', city, ':', error);
      return { lat: 0, lon: 0 };
    }
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private interpolatePoints(lat1: number, lon1: number, lat2: number, lon2: number, segments: number): Array<{lat: number, lon: number}> {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const fraction = i / segments;
      points.push({
        lat: lat1 + (lat2 - lat1) * fraction,
        lon: lon1 + (lon2 - lon1) * fraction
      });
    }
    return points;
  }

  private async fetchEcoPOIs(lat: number, lon: number, radius: number = 5000): Promise<any[]> {
    try {
      const overpassQuery = `
        [out:json];
        (
          node["leisure"="nature_reserve"](around:${radius},${lat},${lon});
          node["tourism"="hotel"]["eco_rating"](around:${radius},${lat},${lon});
          node["amenity"="restaurant"]["diet:vegan"="yes"](around:${radius},${lat},${lon});
        );
        out center;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      });
      
      if (!response.ok) {
        throw new Error(`Overpass API returned status ${response.status}`);
      }
      
      const data = await response.json();
      return data.elements || [];
    } catch (error) {
      console.error('Error fetching eco POIs:', error);
      return [];
    }
  }

  async createItinerary(data: { sourceCity: string; destinationCity: string; numberOfDays: number }) {
    try {
      // 1. Geocode source and destination
      const [sourceCoords, destCoords] = await Promise.all([
        this.geocodeCity(data.sourceCity),
        this.geocodeCity(data.destinationCity)
      ]);

      // 2. Calculate distance and generate waypoints
      const distance = this.calculateHaversineDistance(
        sourceCoords.lat, sourceCoords.lon,
        destCoords.lat, destCoords.lon
      );
      
      const waypoints = this.interpolatePoints(
        sourceCoords.lat, sourceCoords.lon,
        destCoords.lat, destCoords.lon,
        data.numberOfDays
      );

      // 3. Generate daily itinerary
      const days = [];
      const usedActivities = new Set<string>();
      const usedHotels = new Set<string>();
      const usedRestaurants = new Set<string>();

      for (let i = 0; i < data.numberOfDays; i++) {
        const waypoint = waypoints[i + 1]; // Skip first point (source)
        
        // Fetch POIs with a larger radius to ensure we find results
        const pois = await this.fetchEcoPOIs(waypoint.lat, waypoint.lon, 20000); // 20km radius
        
        // Filter and categorize POIs
        const activities = pois.filter((poi: any) => 
          (poi.tags?.leisure === 'nature_reserve' || 
           poi.tags?.tourism === 'attraction' ||
           poi.tags?.natural === 'peak' ||
           poi.tags?.natural === 'waterfall' ||
           poi.tags?.natural === 'volcano' ||
           poi.tags?.natural === 'glacier' ||
           poi.tags?.natural === 'cave' ||
           poi.tags?.natural === 'beach' ||
           poi.tags?.historic === 'castle' ||
           poi.tags?.historic === 'monument' ||
           poi.tags?.historic === 'ruins') &&
           !usedActivities.has(poi.tags?.name || '')
        );
        
        const hotels = pois.filter((poi: any) => 
          (poi.tags?.tourism === 'hotel' || 
           poi.tags?.tourism === 'guest_house' ||
           poi.tags?.tourism === 'hostel' ||
           poi.tags?.tourism === 'chalet' ||
           poi.tags?.tourism === 'apartment') &&
           !usedHotels.has(poi.tags?.name || '')
        );
        
        const restaurants = pois.filter((poi: any) => 
          (poi.tags?.amenity === 'restaurant' || 
           poi.tags?.amenity === 'cafe' ||
           poi.tags?.amenity === 'fast_food' ||
           poi.tags?.amenity === 'bar' ||
           poi.tags?.amenity === 'pub' ||
           poi.tags?.amenity === 'food_court') &&
           !usedRestaurants.has(poi.tags?.name || '')
        );

        // If no POIs found, create unique default ones based on day number
        const defaultActivities = [
          { name: 'Nature Reserve Exploration', type: 'nature_reserve' },
          { name: 'Mountain Hiking Adventure', type: 'peak' },
          { name: 'Waterfall Discovery Tour', type: 'waterfall' },
          { name: 'Volcanic Landscape Tour', type: 'volcano' },
          { name: 'Glacier Viewing Experience', type: 'glacier' },
          { name: 'Cave Exploration', type: 'cave' },
          { name: 'Beach Day', type: 'beach' },
          { name: 'Historic Castle Visit', type: 'castle' },
          { name: 'Ancient Monument Tour', type: 'monument' },
          { name: 'Archaeological Site Visit', type: 'ruins' }
        ];

        const defaultRestaurants = [
          { name: 'Organic Farm-to-Table Restaurant', type: 'restaurant' },
          { name: 'Local Vegan Cafe', type: 'cafe' },
          { name: 'Sustainable Seafood Restaurant', type: 'restaurant' },
          { name: 'Zero-Waste Bistro', type: 'restaurant' },
          { name: 'Farmers Market Food Court', type: 'food_court' },
          { name: 'Eco-Friendly Pub', type: 'pub' },
          { name: 'Green Kitchen', type: 'restaurant' },
          { name: 'Sustainable Sushi Bar', type: 'bar' },
          { name: 'Plant-Based Deli', type: 'restaurant' },
          { name: 'Local Food Experience', type: 'restaurant' }
        ];

        const defaultHotels = [
          { name: 'Eco-Lodge Retreat', eco_rating: 4 },
          { name: 'Sustainable Mountain Resort', eco_rating: 5 },
          { name: 'Green Valley Hotel', eco_rating: 3 },
          { name: 'Eco-Friendly Beach Resort', eco_rating: 4 },
          { name: 'Sustainable Forest Lodge', eco_rating: 5 },
          { name: 'Green City Hotel', eco_rating: 3 },
          { name: 'Eco-Camping Resort', eco_rating: 4 },
          { name: 'Sustainable Chalet', eco_rating: 4 },
          { name: 'Green Apartment Hotel', eco_rating: 3 },
          { name: 'Eco-Friendly Hostel', eco_rating: 3 }
        ];

        const selectedActivity = activities[0] ? {
          name: activities[0].tags?.name || 'Nature Reserve',
          type: activities[0].tags?.leisure || activities[0].tags?.tourism || 'nature_reserve',
          lat: activities[0].lat,
          lon: activities[0].lon
        } : {
          ...defaultActivities[i % defaultActivities.length],
          lat: waypoint.lat,
          lon: waypoint.lon
        };

        const selectedRestaurant = restaurants[0] ? {
          name: restaurants[0].tags?.name || 'Vegan Restaurant',
          type: restaurants[0].tags?.amenity || 'restaurant',
          lat: restaurants[0].lat,
          lon: restaurants[0].lon
        } : {
          ...defaultRestaurants[i % defaultRestaurants.length],
          lat: waypoint.lat,
          lon: waypoint.lon
        };

        const selectedHotel = hotels[0] ? {
          name: hotels[0].tags?.name || 'Eco Hotel',
          lat: hotels[0].lat,
          lon: hotels[0].lon,
          eco_rating: hotels[0].tags?.eco_rating || 3
        } : {
          ...defaultHotels[i % defaultHotels.length],
          lat: waypoint.lat,
          lon: waypoint.lon
        };

        // Add to used sets to prevent duplicates
        usedActivities.add(selectedActivity.name);
        usedRestaurants.add(selectedRestaurant.name);
        usedHotels.add(selectedHotel.name);
        
        days.push({
          day: i + 1,
          waypoint: {
            lat: waypoint.lat,
            lon: waypoint.lon
          },
          activity: selectedActivity,
          lunch: selectedRestaurant,
          hotel: selectedHotel
        });
      }

      // 4. Create and save the itinerary
      const itinerary = new Itinerary({
        source: {
          city: data.sourceCity,
          latitude: sourceCoords.lat,
          longitude: sourceCoords.lon
        },
        destination: {
          city: data.destinationCity,
          latitude: destCoords.lat,
          longitude: destCoords.lon
        },
        totalDistance: distance,
        days,
        createdAt: new Date()
      });

      await itinerary.save();

      // 5. Return the saved itinerary
      return {
        source: itinerary.source,
        destination: itinerary.destination,
        totalDistance: itinerary.totalDistance,
        days: itinerary.days
      };
    } catch (error) {
      console.error('Error creating itinerary:', error);
      throw error;
    }
  }

  async getItineraries(): Promise<IItinerary[]> {
    try {
      return await Itinerary.find().sort({ createdAt: -1 }).exec();
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      throw error;
    }
  }

  async getItinerary(id: string): Promise<IItinerary | null> {
    try {
      return await Itinerary.findById(id).exec();
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      throw error;
    }
  }

  async exportItineraryToPDF(itinerary: any): Promise<Buffer> {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Eco-Friendly Itinerary',
          Author: 'EcoWanderPlanner'
        }
      });

      // Add title
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .text('Eco-Friendly Itinerary', { align: 'center' });
      doc.moveDown();

      // Add journey details
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Journey Details', { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12)
        .font('Helvetica')
        .text(`From: ${itinerary.source.city}`, { continued: true })
        .text(` (${itinerary.source.latitude.toFixed(4)}, ${itinerary.source.longitude.toFixed(4)})`);
      
      doc.text(`To: ${itinerary.destination.city}`, { continued: true })
        .text(` (${itinerary.destination.latitude.toFixed(4)}, ${itinerary.destination.longitude.toFixed(4)})`);
      
      doc.text(`Total Distance: ${itinerary.totalDistance.toFixed(1)} km`);
      doc.moveDown();

      // Add daily itinerary
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('Daily Itinerary', { underline: true });
      doc.moveDown();

      itinerary.days.forEach((day: any) => {
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text(`Day ${day.day}:`, { underline: true });
        doc.moveDown(0.5);

        // Add waypoint
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text('Location:');
        doc.fontSize(10)
          .font('Helvetica')
          .text(`Coordinates: ${day.waypoint.lat.toFixed(4)}, ${day.waypoint.lon.toFixed(4)}`);
        doc.moveDown(0.5);

        // Add activity
        if (day.activity) {
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Activity:');
          doc.fontSize(10)
            .font('Helvetica')
            .text(`${day.activity.name} (${day.activity.type})`);
          doc.moveDown(0.5);
        }

        // Add lunch
        if (day.lunch) {
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Lunch:');
          doc.fontSize(10)
            .font('Helvetica')
            .text(`${day.lunch.name} (${day.lunch.type})`);
          doc.moveDown(0.5);
        }

        // Add hotel
        if (day.hotel) {
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Accommodation:');
          doc.fontSize(10)
            .font('Helvetica')
            .text(`${day.hotel.name} (Eco Rating: ${day.hotel.eco_rating}/5)`);
          doc.moveDown(0.5);
        }

        doc.moveDown();
      });

      // Add footer
      doc.fontSize(10)
        .font('Helvetica')
        .text('Generated by EcoWanderPlanner', { align: 'center' });

      // Finalize the PDF
      doc.end();

      // Return the PDF buffer
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getDestinationById(id: Types.ObjectId): Promise<IDestination | null> {
    return await Destination.findById(id).exec();
  }

  async getTransportOptionById(id: Types.ObjectId): Promise<ITransportOption | null> {
    return await TransportOption.findById(id).exec();
  }

  async getTripById(id: Types.ObjectId): Promise<ITrip | null> {
    return await Trip.findById(id).exec();
  }

  async getListingById(id: Types.ObjectId): Promise<IListing | null> {
    return await Listing.findById(id).exec();
  }

  async getReviewById(id: Types.ObjectId): Promise<IReview | null> {
    return await Review.findById(id).exec();
  }

  async getCarbonRecordById(id: Types.ObjectId): Promise<ICarbonRecord | null> {
    return await CarbonRecord.findById(id).exec();
  }

  async getUsers(): Promise<IUser[]> {
    return await User.find().exec();
  }
} 