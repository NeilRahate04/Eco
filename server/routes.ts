import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tripSearchSchema, carbonCalcSchema, insertTripSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = express.Router();
  
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
      
      const destination = await storage.getDestination(id);
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
      
      // In a real app, this would search for routes between locations
      // For this demo, we'll return mock transport options with calculated values
      const transportOptions = await storage.getTransportOptions();
      
      // Calculate carbon footprint for each transport option
      const results = await Promise.all(
        transportOptions.map(async (option) => {
          const carbonFootprint = await storage.calculateCarbonFootprint(
            searchData.from,
            searchData.to,
            option.type,
            1 // Default to 1 passenger
          );
          
          // Calculate duration based on distance and transport type
          // This is simplified for demo purposes
          const distance = 500; // Default 500km
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
      
      // Sort by eco-priority if requested
      if (searchData.ecoPriority) {
        results.sort((a, b) => a.carbonFootprint - b.carbonFootprint);
      }
      
      res.json({
        from: searchData.from,
        to: searchData.to,
        date: searchData.when,
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
      
      const transportOptions = await storage.getTransportOptions();
      
      // Calculate carbon footprint for each transport option
      const results = await Promise.all(
        transportOptions.map(async (option) => {
          const carbonFootprint = await storage.calculateCarbonFootprint(
            calcData.from,
            calcData.to,
            option.type,
            calcData.passengers
          );
          
          // Calculate duration based on distance and transport type
          // This is simplified for demo purposes
          const distance = 500; // Default 500km
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
          const durationHours = Math.floor(durationMinutes / 60);
          const remainingMinutes = durationMinutes % 60;
          const durationFormatted = `${durationHours} hours ${remainingMinutes} minutes`;
          
          return {
            transportOption: option,
            carbonFootprint,
            durationMinutes,
            durationFormatted
          };
        })
      );
      
      // Sort by carbon footprint (lowest first)
      results.sort((a, b) => a.carbonFootprint - b.carbonFootprint);
      
      res.json({
        from: calcData.from,
        to: calcData.to,
        passengers: calcData.passengers,
        results
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
  
  // Trips routes
  apiRouter.get("/trips", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the authenticated session
      // For this demo, we'll use a default user ID
      const userId = 1;
      
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

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
