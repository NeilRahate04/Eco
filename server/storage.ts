import { 
  users, type User, type InsertUser,
  destinations, type Destination, type InsertDestination,
  transportOptions, type TransportOption, type InsertTransportOption,
  trips, type Trip, type InsertTrip
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  getTrip(id: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  calculateCarbonFootprint(fromLocation: string, toLocation: string, transportType: string, passengers: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private destinations: Map<number, Destination>;
  private transportOptions: Map<number, TransportOption>;
  private trips: Map<number, Trip>;
  
  // Auto-incrementing IDs
  private userCurrentId: number;
  private destinationCurrentId: number;
  private transportOptionCurrentId: number;
  private tripCurrentId: number;

  constructor() {
    this.users = new Map();
    this.destinations = new Map();
    this.transportOptions = new Map();
    this.trips = new Map();
    
    this.userCurrentId = 1;
    this.destinationCurrentId = 1;
    this.transportOptionCurrentId = 1;
    this.tripCurrentId = 1;
    
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const newDestination: Destination = { ...destination, id };
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
    const newOption: TransportOption = { ...option, id };
    this.transportOptions.set(id, newOption);
    return newOption;
  }
  
  // Trip methods
  async getTrips(userId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.userId === userId);
  }
  
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }
  
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = this.tripCurrentId++;
    const newTrip: Trip = { 
      ...trip, 
      id, 
      createdAt: new Date() 
    };
    this.trips.set(id, newTrip);
    return newTrip;
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
