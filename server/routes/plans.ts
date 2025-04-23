import express from 'express';
import { storage } from '../storage';
import { verifyToken } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { insertTripSchema } from "@shared/mongodb-schema";
import { Types } from 'mongoose';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Extend the Request type to include sessionID
declare module 'express-serve-static-core' {
  interface Request {
    sessionID: string;
  }
}

const router = express.Router();

/**
 * Create a new trip/plan
 * POST /api/plans
 */
router.post('/', verifyToken, validateSchema(insertTripSchema), async (req, res) => {
  try {
    // Get the session
    const session = await storage.sessionStore.get(req.sessionID);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Create trip
    const trip = await storage.createTrip({
      ...req.body,
      userId: new Types.ObjectId(session.userId)
    });
    
    // If the trip includes carbon information, record it
    if (req.body.carbonFootprint && req.body.carbonFootprint > 0) {
      await storage.createCarbonRecord({
        userId: new Types.ObjectId(session.userId),
        tripId: trip._id,
        footprintValue: req.body.carbonFootprint,
        details: {
          fromLocation: trip.fromLocation,
          toLocation: trip.toLocation,
          transportType: trip.transportOptionId ? 'transport' : 'unknown'
        }
      });
    }
    
    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid trip data', 
        errors: fromZodError(error).message 
      });
    }
    res.status(500).json({ message: 'Server error creating trip' });
  }
});

/**
 * Get all trips by destination
 * GET /api/plans/destination/:destination
 */
router.get('/destination/:destination', async (req, res) => {
  try {
    const destination = req.params.destination;
    
    const trips = await storage.getTripsByDestination(destination);
    
    // For public consumption, filter out sensitive data
    const publicTrips = trips.map(trip => {
      const { userId, ...publicTrip } = trip;
      return publicTrip;
    });
    
    res.json(publicTrips);
  } catch (error) {
    console.error('Get trips by destination error:', error);
    res.status(500).json({ message: 'Server error getting trips' });
  }
});

/**
 * Get trip by ID
 * GET /api/plans/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const tripId = new Types.ObjectId(req.params.id);
    
    // Get trip
    const trip = await storage.getTrip(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Get the session
    const session = await storage.sessionStore.get(req.sessionID);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if user owns the trip
    if (trip.userId.toString() !== session.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this trip' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ message: 'Server error getting trip' });
  }
});

/**
 * Get all trips for the authenticated user
 * GET /api/plans
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get the session
    const session = await storage.sessionStore.get(req.sessionID);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get trips
    const trips = await storage.getTrips(new Types.ObjectId(session.userId));
    
    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Server error getting trips' });
  }
});

/**
 * Delete a trip
 * DELETE /api/plans/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const tripId = new Types.ObjectId(req.params.id);
    
    // Get trip
    const trip = await storage.getTrip(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Get the session
    const session = await storage.sessionStore.get(req.sessionID);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if user owns the trip
    if (trip.userId.toString() !== session.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this trip' });
    }
    
    // Delete trip
    const deleted = await storage.deleteTrip(tripId);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete trip' });
    }
    
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Server error deleting trip' });
  }
});

export default router;