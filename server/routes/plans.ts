import express from 'express';
import { storage } from '../storage';
import { verifyToken } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { insertTripSchema } from '@shared/schema';

const router = express.Router();

/**
 * Create a new trip/plan
 * POST /api/plans
 */
router.post('/', verifyToken, validateSchema(insertTripSchema), async (req, res) => {
  try {
    // Set user ID from authenticated user
    const tripData = {
      ...req.body,
      userId: req.user?.id
    };
    
    // Create the trip plan
    const plan = await storage.createTrip(tripData);
    
    // Create carbon record if carbon footprint is provided
    if (plan.carbonFootprint) {
      await storage.createCarbonRecord({
        userId: req.user?.id!,
        tripId: plan.id,
        footprintValue: plan.carbonFootprint,
        details: {
          transportType: plan.transportOptionId ? 
            (await storage.getTransportOption(plan.transportOptionId))?.type : 'unknown',
          fromLocation: plan.fromLocation,
          toLocation: plan.toLocation,
          date: plan.departureDate
        }
      });
    }
    
    res.status(201).json(plan);
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Server error creating plan' });
  }
});

/**
 * Get all trips by destination
 * GET /api/plans/destination/:destination
 */
router.get('/destination/:destination', verifyToken, async (req, res) => {
  try {
    const destination = req.params.destination;
    const plans = await storage.getTripsByDestination(destination);
    
    // Filter to only show public plans or user's own plans
    const filteredPlans = plans.filter(plan => 
      plan.userId === req.user?.id || req.user?.role === 'admin'
    );
    
    res.json(filteredPlans);
  } catch (error) {
    console.error('Get plans by destination error:', error);
    res.status(500).json({ message: 'Server error getting plans by destination' });
  }
});

/**
 * Get trip by ID
 * GET /api/plans/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const plan = await storage.getTrip(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Check if user has access to this plan
    if (plan.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Server error getting plan' });
  }
});

/**
 * Delete a trip
 * DELETE /api/plans/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const plan = await storage.getTrip(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Check if user owns this plan
    if (plan.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Cannot delete another user\'s plan' });
    }
    
    const deleted = await storage.deleteTrip(planId);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete plan' });
    }
    
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Server error deleting plan' });
  }
});

export default router;