import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { MongoDBStorage } from "./mongodb-storage";
import { tripSearchSchema, carbonCalcSchema, insertTripSchema } from "@shared/mongodb-schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { Types } from "mongoose";

// Import route modules
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import plansRoutes from "./routes/plans";
import carbonRoutes from "./routes/carbon";
import reviewsRoutes from "./routes/reviews";
import adminRoutes from "./routes/admin";
import listingsRoutes from "./routes/listings";

// Create MongoDB storage instance
const storage = new MongoDBStorage();

export function registerRoutes(app: Express) {
  // Middleware
  app.use(cookieParser());

  // API Routes
  const apiRouter = express.Router();
  
  // Mount route modules
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/users", usersRoutes);
  apiRouter.use("/plans", plansRoutes);
  apiRouter.use("/carbon", carbonRoutes);
  apiRouter.use("/reviews", reviewsRoutes);
  apiRouter.use("/admin", adminRoutes);
  apiRouter.use("/listings", listingsRoutes);
  
  // Itinerary routes
  apiRouter.post("/itinerary", async (req, res) => {
    try {
      console.log('Received itinerary request:', req.body);
      const { sourceCity, destinationCity, numberOfDays } = req.body;
      
      if (!sourceCity || !destinationCity || !numberOfDays) {
        return res.status(400).json({ 
          message: "Missing required fields",
          received: { sourceCity, destinationCity, numberOfDays }
        });
      }

      const itinerary = await storage.createItinerary({
        sourceCity,
        destinationCity,
        numberOfDays
      });
      
      console.log('Generated itinerary:', itinerary);
      res.json(itinerary);
    } catch (error) {
      console.error('Error creating itinerary:', error);
      res.status(500).json({ 
        message: "Failed to create itinerary",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  apiRouter.get("/itineraries", async (req, res) => {
    try {
      const itineraries = await storage.getItineraries();
      res.json(itineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      res.status(500).json({ 
        message: "Failed to fetch itineraries",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  apiRouter.get("/itinerary/:id", async (req, res) => {
    try {
      const itinerary = await storage.getItinerary(req.params.id);
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      res.json(itinerary);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      res.status(500).json({ 
        message: "Failed to fetch itinerary",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  apiRouter.post("/itinerary/export", async (req, res) => {
    try {
      const itinerary = req.body;
      console.log('Received export request with itinerary:', JSON.stringify(itinerary, null, 2));
      
      if (!itinerary || !itinerary.days || !itinerary.source || !itinerary.destination) {
        console.error('Invalid itinerary data received:', itinerary);
        return res.status(400).json({ 
          message: "Invalid itinerary data",
          received: itinerary
        });
      }

      const pdfBuffer: Buffer = await storage.exportItineraryToPDF(itinerary);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=eco-itinerary.pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Detailed error exporting itinerary:', error);
      res.status(500).json({ 
        message: "Failed to export itinerary",
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });
  
  // Destinations routes
  apiRouter.get("/destinations", async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });
  
  apiRouter.get("/destinations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      
      const destination = await storage.getDestination(new Types.ObjectId(id));
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      
      res.json(destination);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });
  
  // Transport options routes
  apiRouter.get("/transport-options", async (req, res) => {
    try {
      const options = await storage.getTransportOptions();
      res.json(options);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transport options" });
    }
  });
  
  // Trip search route
  apiRouter.post("/trip-search", async (req, res) => {
    try {
      const searchData = tripSearchSchema.parse(req.body);
      
      const transportOptions = await storage.getTransportOptions();
      
      const results = await Promise.all(
        transportOptions.map(async (option) => {
          const carbonFootprint = await storage.calculateCarbonFootprint(
            searchData.fromLocation,
            searchData.toLocation,
            option.type,
            1
          );
          
          const distance = 500;
          let speedKmh;
          
          switch (option.type) {
            case 'train':
              speedKmh = 80;
              break;
            case 'bus':
              speedKmh = 60;
              break;
            case 'car':
              speedKmh = 90;
              break;
            case 'plane':
              speedKmh = 800;
              break;
            default:
              speedKmh = 70;
          }
          
          const durationMinutes = Math.round((distance / speedKmh) * 60);
          
          return {
            option,
            carbonFootprint,
            durationMinutes
          };
        })
      );
      
      res.json({
        from: searchData.fromLocation,
        to: searchData.toLocation,
        date: searchData.departureDate,
        results
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to search for trips" });
    }
  });
  
  // Carbon calculator route
  apiRouter.post("/calculate-carbon", async (req, res) => {
    try {
      const calcData = carbonCalcSchema.parse(req.body);
      const transportOption = await storage.getTransportOption(calcData.transportOptionId);
      
      if (!transportOption) {
        return res.status(404).json({ message: "Transport option not found" });
      }

      const carbonFootprint = await storage.calculateCarbonFootprint(
        "origin",
        "destination",
        transportOption.type,
        1
      );
      
      const distance = calcData.distance;
      let speedKmh;
      
      switch (transportOption.type) {
        case 'train':
          speedKmh = 80;
          break;
        case 'bus':
          speedKmh = 60;
          break;
        case 'car':
          speedKmh = 90;
          break;
        case 'plane':
          speedKmh = 800;
          break;
        default:
          speedKmh = 70;
      }
      
      const durationMinutes = Math.round((distance / speedKmh) * 60);
      const durationHours = Math.floor(durationMinutes / 60);
      const remainingMinutes = durationMinutes % 60;
      const durationFormatted = `${durationHours} hours ${remainingMinutes} minutes`;
      
      res.json({
        distance: calcData.distance,
        transportOption,
        carbonFootprint,
        durationMinutes,
        durationFormatted
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid calculation parameters", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to calculate carbon footprint" });
    }
  });
  
  // Trips routes - these will be migrated to plans.ts in future
  apiRouter.get("/trips", async (req, res) => {
    try {
      const userId = new Types.ObjectId(1);
      
      const trips = await storage.getTrips(userId);
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });
  
  apiRouter.post("/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      
      const trip = await storage.createTrip(tripData);
      res.status(201).json(trip);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid trip data", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  return apiRouter;
}
