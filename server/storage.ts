import { 
  type User, type UserPreferences,
  type Destination,
  type TransportOption,
  type Trip,
  type CarbonRecord,
  type Listing,
  type Review,
  type InsertUser,
  type InsertDestination,
  type InsertTransportOption,
  type InsertTrip,
  type InsertCarbonRecord,
  type InsertListing,
  type InsertReview
} from "@shared/mongodb-schema";
import { Types } from 'mongoose';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: Types.ObjectId): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: Types.ObjectId, preferences: UserPreferences): Promise<User | undefined>;
  
  // Destination operations
  getDestinations(): Promise<Destination[]>;
  getDestination(id: Types.ObjectId): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  
  // Transport options operations
  getTransportOptions(): Promise<TransportOption[]>;
  getTransportOption(id: Types.ObjectId): Promise<TransportOption | undefined>;
  createTransportOption(option: InsertTransportOption): Promise<TransportOption>;
  
  // Trip operations
  getTrips(userId: Types.ObjectId): Promise<Trip[]>;
  getTripsByDestination(destination: string): Promise<Trip[]>;
  getTrip(id: Types.ObjectId): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  deleteTrip(id: Types.ObjectId): Promise<boolean>;
  
  // Carbon footprint operations
  calculateCarbonFootprint(fromLocation: string, toLocation: string, transportType: string, passengers: number): Promise<number>;
  getCarbonRecords(userId: Types.ObjectId): Promise<CarbonRecord[]>;
  createCarbonRecord(record: InsertCarbonRecord): Promise<CarbonRecord>;
  
  // Listings operations
  getListings(): Promise<Listing[]>;
  getListing(id: Types.ObjectId): Promise<Listing | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: Types.ObjectId, listing: Partial<InsertListing>): Promise<Listing | undefined>;
  
  // Review operations
  getReviews(serviceType: string, serviceId: Types.ObjectId): Promise<Review[]>;
  getReview(id: Types.ObjectId): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  approveReview(id: Types.ObjectId): Promise<Review | undefined>;
  getDestinationReviews(destination: string): Promise<Review[]>;
  
  // Session store
  sessionStore: any;

  // Itinerary operations
  createItinerary(data: { sourceCity: string; destinationCity: string; numberOfDays: number }): Promise<any>;
  exportItineraryToPDF(itinerary: any): Promise<Buffer>;

  getDestinationById(id: Types.ObjectId): Promise<Destination | null>;
  getTransportOptionById(id: Types.ObjectId): Promise<TransportOption | null>;
  getTripById(id: Types.ObjectId): Promise<Trip | null>;
  getListingById(id: Types.ObjectId): Promise<Listing | null>;
  getReviewById(id: Types.ObjectId): Promise<Review | null>;
  getCarbonRecordById(id: Types.ObjectId): Promise<CarbonRecord | null>;
  getUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private destinations: Map<string, Destination>;
  private transportOptions: Map<string, TransportOption>;
  private trips: Map<string, Trip>;
  private carbonRecords: Map<string, CarbonRecord>;
  private listings: Map<string, Listing>;
  private reviews: Map<string, Review>;
  private sessions: Map<string, any>;
  public sessionStore: any;
  
  constructor() {
    this.users = new Map();
    this.destinations = new Map();
    this.transportOptions = new Map();
    this.trips = new Map();
    this.carbonRecords = new Map();
    this.listings = new Map();
    this.reviews = new Map();
    this.sessions = new Map();
    
    // Create a simple in-memory session store
    this.sessionStore = {
      sessions: new Map(),
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
    
    // Initialize with sample data
    this.initializeData();
  }

  private async initializeData() {
    try {
      await this.initializeTransportOptions();
      await this.initializeDestinations();
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }

  private async initializeTransportOptions() {
    const options: InsertTransportOption[] = [
      {
        name: "Train",
        type: "rail",
        icon: "train",
        carbonPerKm: 0.041,
        carbonCategory: "low",
        colorClass: "bg-green-100 text-green-800"
      },
      {
        name: "Bus",
        type: "road",
        icon: "bus",
        carbonPerKm: 0.089,
        carbonCategory: "medium",
        colorClass: "bg-yellow-100 text-yellow-800"
      },
      {
        name: "Car",
        type: "road",
        icon: "car",
        carbonPerKm: 0.192,
        carbonCategory: "high",
        colorClass: "bg-red-100 text-red-800"
      },
      {
        name: "Plane",
        type: "air",
        icon: "plane",
        carbonPerKm: 0.255,
        carbonCategory: "very-high",
        colorClass: "bg-purple-100 text-purple-800"
      }
    ];

    for (const option of options) {
      await this.createTransportOption(option);
    }
  }
  
  private async initializeDestinations() {
    const destinations: InsertDestination[] = [
      {
        name: "Costa Rica",
        country: "Costa Rica",
        description: "A paradise for eco-tourism with lush rainforests and sustainable practices",
        image_url: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        rating: 5,
        ecoCertified: true,
        carbonImpact: "Low",
        carbonScore: 85
      },
      {
        name: "Norway",
        country: "Norway",
        description: "Sustainable living and breathtaking fjords",
        image_url: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        rating: 5,
        ecoCertified: true,
        carbonImpact: "Very Low",
        carbonScore: 90
      },
      {
        name: "New Zealand",
        country: "New Zealand",
        description: "Clean and green with strong environmental policies",
        image_url: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        rating: 4,
        ecoCertified: true,
        carbonImpact: "Low",
        carbonScore: 80
      },
      {
        name: "Switzerland",
        country: "Switzerland",
        description: "Efficient public transport and clean energy",
        image_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        rating: 4,
        ecoCertified: true,
        carbonImpact: "Low",
        carbonScore: 75
      },
      {
        name: "Bhutan",
        country: "Bhutan",
        description: "Carbon negative country with rich culture",
        image_url: "https://images.unsplash.com/photo-1580077871668-6a81a8093e6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        rating: 5,
        ecoCertified: true,
        carbonImpact: "Negative",
        carbonScore: 95
      },
      {
        name: "Iceland",
        country: "Iceland",
        description: "Renewable energy leader with stunning landscapes",
        image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        rating: 4,
        ecoCertified: true,
        carbonImpact: "Very Low",
        carbonScore: 85
      }
    ];

    for (const destination of destinations) {
      await this.createDestination(destination);
    }
  }

  // User methods
  async getUser(id: Types.ObjectId): Promise<User | undefined> {
    return this.users.get(id.toString());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = new Types.ObjectId();
    const user: User = {
      ...insertUser,
      _id: id,
      preferences: {
        preferredTransportTypes: [],
        preferredDestinations: [],
        ecoMode: false,
        notificationsEnabled: true,
        theme: "light"
      },
      createdAt: new Date()
    };
    this.users.set(id.toString(), user);
    return user;
  }
  
  async updateUserPreferences(userId: Types.ObjectId, preferences: UserPreferences): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };
    
    this.users.set(userId.toString(), updatedUser);
    return updatedUser;
  }
  
  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }
  
  async getDestination(id: Types.ObjectId): Promise<Destination | undefined> {
    return this.destinations.get(id.toString());
  }
  
  async createDestination(destination: InsertDestination): Promise<Destination> {
    const id = new Types.ObjectId();
    const newDestination: Destination = {
      ...destination,
      _id: id,
      createdAt: new Date()
    };
    this.destinations.set(id.toString(), newDestination);
    return newDestination;
  }
  
  // Transport options methods
  async getTransportOptions(): Promise<TransportOption[]> {
    return Array.from(this.transportOptions.values());
  }
  
  async getTransportOption(id: Types.ObjectId): Promise<TransportOption | undefined> {
    return this.transportOptions.get(id.toString());
  }
  
  async createTransportOption(option: InsertTransportOption): Promise<TransportOption> {
    const id = new Types.ObjectId();
    const newOption: TransportOption = {
      ...option,
      _id: id,
      createdAt: new Date()
    };
    this.transportOptions.set(id.toString(), newOption);
    return newOption;
  }
  
  // Trip methods
  async getTrips(userId: Types.ObjectId): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.userId.toString() === userId.toString());
  }
  
  async getTripsByDestination(destination: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.toLocation === destination);
  }
  
  async getTrip(id: Types.ObjectId): Promise<Trip | undefined> {
    return this.trips.get(id.toString());
  }
  
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = new Types.ObjectId();
    const newTrip: Trip = {
      ...trip,
      _id: id,
      createdAt: new Date()
    };
    this.trips.set(id.toString(), newTrip);
    return newTrip;
  }
  
  async deleteTrip(id: Types.ObjectId): Promise<boolean> {
    return this.trips.delete(id.toString());
  }
  
  // Carbon record methods
  async getCarbonRecords(userId: Types.ObjectId): Promise<CarbonRecord[]> {
    return Array.from(this.carbonRecords.values()).filter(record => record.userId.toString() === userId.toString());
  }
  
  async createCarbonRecord(record: InsertCarbonRecord): Promise<CarbonRecord> {
    const id = new Types.ObjectId();
    const newRecord: CarbonRecord = {
      ...record,
      _id: id,
      createdAt: new Date()
    };
    this.carbonRecords.set(id.toString(), newRecord);
    return newRecord;
  }
  
  // Listing methods
  async getListings(): Promise<Listing[]> {
    return Array.from(this.listings.values());
  }
  
  async getListing(id: Types.ObjectId): Promise<Listing | undefined> {
    return this.listings.get(id.toString());
  }
  
  async createListing(listing: InsertListing): Promise<Listing> {
    const id = new Types.ObjectId();
    const newListing: Listing = {
      ...listing,
      _id: id,
      createdAt: new Date()
    };
    this.listings.set(id.toString(), newListing);
    return newListing;
  }
  
  async updateListing(id: Types.ObjectId, listing: Partial<InsertListing>): Promise<Listing | undefined> {
    const existingListing = await this.getListing(id);
    if (!existingListing) return undefined;
    
    const updatedListing: Listing = {
      ...existingListing,
      ...listing,
      _id: id
    };
    
    this.listings.set(id.toString(), updatedListing);
    return updatedListing;
  }
  
  async deleteListing(id: Types.ObjectId): Promise<boolean> {
    return this.listings.delete(id.toString());
  }
  
  // Review methods
  async getReviews(serviceType: string, serviceId: Types.ObjectId): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.serviceType === serviceType && review.serviceId.toString() === serviceId.toString()
    );
  }
  
  async getReview(id: Types.ObjectId): Promise<Review | undefined> {
    return this.reviews.get(id.toString());
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = new Types.ObjectId();
    const newReview: Review = {
      ...review,
      _id: id,
      createdAt: new Date()
    };
    this.reviews.set(id.toString(), newReview);
    return newReview;
  }
  
  async approveReview(id: Types.ObjectId): Promise<Review | undefined> {
    const review = await this.getReview(id);
    if (!review) return undefined;
    
    const approvedReview: Review = {
      ...review,
      approved: true
    };
    
    this.reviews.set(id.toString(), approvedReview);
    return approvedReview;
  }
  
  async getDestinationReviews(destination: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.serviceType === 'destination' && review.serviceId.toString() === destination
    );
  }
  
  // Carbon footprint calculation
  async calculateCarbonFootprint(
    fromLocation: string, 
    toLocation: string, 
    transportType: string, 
    passengers: number
  ): Promise<number> {
    // In a real app, this would use a geocoding API to get actual distances
    // For demo purposes, we'll use fixed distances for specific routes
    const distance = this.getEstimatedDistance(fromLocation, toLocation);
    
    // Find the transport option
    const transport = Array.from(this.transportOptions.values()).find(
      (option) => option.type.toLowerCase() === transportType.toLowerCase()
    );
    
    if (!transport) {
      throw new Error(`Transport type ${transportType} not found`);
    }
    
    // Calculate total carbon footprint in grams
    const totalCarbon = transport.carbonPerKm * distance;
    
    // Divide by passengers for per-person footprint
    return Math.round(totalCarbon / passengers);
  }
  
  // Helper method to get estimated distance between locations
  private getEstimatedDistance(from: string, to: string): number {
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

  // Itinerary methods
  async createItinerary(data: { sourceCity: string; destinationCity: string; numberOfDays: number }): Promise<any> {
    // For in-memory storage, return a mock itinerary
    return {
      sourceCity: data.sourceCity,
      destinationCity: data.destinationCity,
      numberOfDays: data.numberOfDays,
      dailyItinerary: Array(data.numberOfDays).fill({
        activities: [],
        lunch: null,
        hotel: null
      })
    };
  }

  async exportItineraryToPDF(itinerary: any): Promise<Buffer> {
    // For in-memory storage, return an empty buffer
    return Buffer.from('');
  }

  async getDestinationById(id: Types.ObjectId): Promise<Destination | null> {
    return this.destinations.get(id.toString()) || null;
  }

  async getTransportOptionById(id: Types.ObjectId): Promise<TransportOption | null> {
    return this.transportOptions.get(id.toString()) || null;
  }

  async getTripById(id: Types.ObjectId): Promise<Trip | null> {
    return this.trips.get(id.toString()) || null;
  }

  async getListingById(id: Types.ObjectId): Promise<Listing | null> {
    return this.listings.get(id.toString()) || null;
  }

  async getReviewById(id: Types.ObjectId): Promise<Review | null> {
    return this.reviews.get(id.toString()) || null;
  }

  async getCarbonRecordById(id: Types.ObjectId): Promise<CarbonRecord | null> {
    return this.carbonRecords.get(id.toString()) || null;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();
