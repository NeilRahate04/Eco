import { 
  users, type User, type InsertUser, type UserPreferences,
  destinations, type Destination, type InsertDestination,
  transportOptions, type TransportOption, type InsertTransportOption,
  trips, type Trip, type InsertTrip,
  carbonRecords, type CarbonRecord, type InsertCarbonRecord,
  listings, type Listing, type InsertListing,
  reviews, type Review, type InsertReview
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: UserPreferences): Promise<User | undefined>;
  
  // Destination operations
  getDestinations(): Promise<Destination[]>;
  getDestination(id: number): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  
  // Transport options operations
  getTransportOptions(): Promise<TransportOption[]>;
  getTransportOption(id: number): Promise<TransportOption | undefined>;
  createTransportOption(option: InsertTransportOption): Promise<TransportOption>;
  
  // Trip operations
  getTrips(userId: number): Promise<Trip[]>;
  getTripsByDestination(destination: string): Promise<Trip[]>;
  getTrip(id: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  deleteTrip(id: number): Promise<boolean>;
  
  // Carbon footprint operations
  calculateCarbonFootprint(fromLocation: string, toLocation: string, transportType: string, passengers: number): Promise<number>;
  getCarbonRecords(userId: number): Promise<CarbonRecord[]>;
  createCarbonRecord(record: InsertCarbonRecord): Promise<CarbonRecord>;
  
  // Listings operations
  getListings(): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  
  // Reviews operations
  getReviews(serviceType: string, serviceId: number): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  approveReview(id: number): Promise<Review | undefined>;
  getDestinationReviews(destination: string): Promise<Review[]>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private destinations: Map<number, Destination>;
  private transportOptions: Map<number, TransportOption>;
  private trips: Map<number, Trip>;
  private carbonRecords: Map<number, CarbonRecord>;
  private listings: Map<number, Listing>;
  private reviews: Map<number, Review>;
  public sessionStore: any;
  
  // Auto-incrementing IDs
  private userCurrentId: number;
  private destinationCurrentId: number;
  private transportOptionCurrentId: number;
  private tripCurrentId: number;
  private carbonRecordCurrentId: number;
  private listingCurrentId: number;
  private reviewCurrentId: number;

  constructor() {
    this.users = new Map();
    this.destinations = new Map();
    this.transportOptions = new Map();
    this.trips = new Map();
    this.carbonRecords = new Map();
    this.listings = new Map();
    this.reviews = new Map();
    
    // Create a simple in-memory session store
    this.sessionStore = {
      get: () => Promise.resolve(),
      set: () => Promise.resolve(),
      destroy: () => Promise.resolve(),
      all: () => Promise.resolve([]),
      clear: () => Promise.resolve(),
      length: () => Promise.resolve(0),
      touch: () => Promise.resolve()
    };
    
    this.userCurrentId = 1;
    this.destinationCurrentId = 1;
    this.transportOptionCurrentId = 1;
    this.tripCurrentId = 1;
    this.carbonRecordCurrentId = 1;
    this.listingCurrentId = 1;
    this.reviewCurrentId = 1;
    
    // Initialize with sample data
    this.initializeTransportOptions();
    this.initializeDestinations();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      preferences: null, 
      createdAt: new Date(),
      role: insertUser.role || 'user' // Ensure role is never undefined
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPreferences(userId: number, preferences: UserPreferences): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      preferences
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }
  
  async getDestination(id: number): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }
  
  async createDestination(destination: InsertDestination): Promise<Destination> {
    const id = this.destinationCurrentId++;
    const newDestination: Destination = { 
      ...destination, 
      id, 
      createdAt: new Date(),
      ecoCertified: destination.ecoCertified ?? false // Ensure ecoCertified is never undefined
    };
    this.destinations.set(id, newDestination);
    return newDestination;
  }
  
  // Transport options methods
  async getTransportOptions(): Promise<TransportOption[]> {
    return Array.from(this.transportOptions.values());
  }
  
  async getTransportOption(id: number): Promise<TransportOption | undefined> {
    return this.transportOptions.get(id);
  }
  
  async createTransportOption(option: InsertTransportOption): Promise<TransportOption> {
    const id = this.transportOptionCurrentId++;
    const newOption: TransportOption = { 
      ...option, 
      id, 
      createdAt: new Date() 
    };
    this.transportOptions.set(id, newOption);
    return newOption;
  }
  
  // Trip methods
  async getTrips(userId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.userId === userId);
  }
  
  async getTripsByDestination(destination: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => 
      trip.toLocation.toLowerCase().includes(destination.toLowerCase())
    );
  }
  
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }
  
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = this.tripCurrentId++;
    const newTrip: Trip = { 
      ...trip, 
      id, 
      userId: trip.userId || null,
      transportOptionId: trip.transportOptionId || null,
      createdAt: new Date() 
    };
    this.trips.set(id, newTrip);
    return newTrip;
  }
  
  async deleteTrip(id: number): Promise<boolean> {
    return this.trips.delete(id);
  }
  
  // Carbon record methods
  async getCarbonRecords(userId: number): Promise<CarbonRecord[]> {
    return Array.from(this.carbonRecords.values()).filter(record => record.userId === userId);
  }
  
  async createCarbonRecord(record: InsertCarbonRecord): Promise<CarbonRecord> {
    const id = this.carbonRecordCurrentId++;
    const newRecord: CarbonRecord = {
      ...record,
      id,
      tripId: record.tripId || null, // Ensure tripId is never undefined
      details: record.details || null, // Ensure details is never undefined
      createdAt: new Date()
    };
    this.carbonRecords.set(id, newRecord);
    return newRecord;
  }
  
  // Listing methods
  async getListings(): Promise<Listing[]> {
    return Array.from(this.listings.values());
  }
  
  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }
  
  async createListing(listing: InsertListing): Promise<Listing> {
    const id = this.listingCurrentId++;
    const newListing: Listing = {
      ...listing,
      id,
      createdAt: new Date()
    };
    this.listings.set(id, newListing);
    return newListing;
  }
  
  async updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing | undefined> {
    const existingListing = await this.getListing(id);
    if (!existingListing) return undefined;
    
    const updatedListing: Listing = {
      ...existingListing,
      ...listing
    };
    
    this.listings.set(id, updatedListing);
    return updatedListing;
  }
  
  async deleteListing(id: number): Promise<boolean> {
    return this.listings.delete(id);
  }
  
  // Review methods
  async getReviews(serviceType: string, serviceId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.serviceType === serviceType && review.serviceId === serviceId
    );
  }
  
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const newReview: Review = {
      ...review,
      id,
      approved: review.approved ?? false, // Ensure approved is never undefined
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    return newReview;
  }
  
  async approveReview(id: number): Promise<Review | undefined> {
    const review = await this.getReview(id);
    if (!review) return undefined;
    
    const approvedReview: Review = {
      ...review,
      approved: true
    };
    
    this.reviews.set(id, approvedReview);
    return approvedReview;
  }
  
  async getDestinationReviews(destination: string): Promise<Review[]> {
    // First find all destination IDs that match the name
    const destinationIds = Array.from(this.destinations.values())
      .filter(dest => dest.name.toLowerCase().includes(destination.toLowerCase()))
      .map(dest => dest.id);
    
    // Then find all reviews for those destinations
    return Array.from(this.reviews.values()).filter(
      review => review.serviceType === 'destination' && 
                destinationIds.includes(review.serviceId) &&
                review.approved
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
  
  // Initialize with transport options data
  private initializeTransportOptions() {
    const options: InsertTransportOption[] = [
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
    
    options.forEach(option => {
      this.createTransportOption(option);
    });
  }
  
  // Initialize with destination data
  private initializeDestinations() {
    const destinations: InsertDestination[] = [
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
      },
      {
        name: "New Zealand",
        country: "New Zealand",
        description: "Leading in sustainable tourism with pristine landscapes and conservation efforts.",
        image_url: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 49,
        ecoCertified: true,
        carbonImpact: "Medium Carbon Impact",
        carbonScore: 2
      },
      {
        name: "Iceland",
        country: "Iceland",
        description: "Geothermal wonders and untouched nature with a strong commitment to sustainability.",
        image_url: "https://images.unsplash.com/photo-1504206270341-2bae970cfc42?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 47,
        ecoCertified: true,
        carbonImpact: "Medium Carbon Impact",
        carbonScore: 2
      },
      {
        name: "Slovenia",
        country: "Slovenia",
        description: "Green destination with pristine forests, lakes and sustainable tourism infrastructure.",
        image_url: "https://images.unsplash.com/photo-1553292558-92e5286cf507?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 46,
        ecoCertified: true,
        carbonImpact: "Low Carbon Impact",
        carbonScore: 1
      },
      {
        name: "Bhutan",
        country: "Bhutan",
        description: "Carbon-negative country with strictly managed tourism and pristine natural areas.",
        image_url: "https://images.unsplash.com/photo-1515695820260-1e329888abd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 48,
        ecoCertified: true,
        carbonImpact: "Low Carbon Impact",
        carbonScore: 1
      }
    ];
    
    destinations.forEach(destination => {
      this.createDestination(destination);
    });
  }
}

export const storage = new MemStorage();
