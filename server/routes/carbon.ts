import express from 'express';
import { storage } from '../storage';
import { verifyToken } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { insertCarbonRecordSchema } from "@shared/mongodb-schema";
import { Types } from 'mongoose';
import { calculateCarbonFootprint, compareTransportOptions, getAllTransportOptions } from '../services/carbonCalculator';
import { z } from 'zod';

const router = express.Router();

/**
 * Calculate carbon footprint
 * POST /api/carbon/calculate
 */
router.post('/calculate', verifyToken, async (req, res) => {
  try {
    const { fromLocation, toLocation, transportType, passengers } = req.body;
    
    // Calculate carbon footprint
    const carbonFootprint = await storage.calculateCarbonFootprint(
      fromLocation,
      toLocation,
      transportType,
      passengers
    );
    
    res.json({ carbonFootprint });
  } catch (error) {
    console.error('Calculate carbon footprint error:', error);
    res.status(500).json({ message: 'Server error calculating carbon footprint' });
  }
});

/**
 * Get carbon records for a user
 * GET /api/carbon/records
 */
router.get('/records', verifyToken, async (req, res) => {
  try {
    // Get the session
    const session = await storage.sessionStore.get(req.sessionID);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get carbon records
    const records = await storage.getCarbonRecords(new Types.ObjectId(session.userId));
    
    res.json(records);
  } catch (error) {
    console.error('Get carbon records error:', error);
    res.status(500).json({ message: 'Server error getting carbon records' });
  }
});

/**
 * Create a carbon record
 * POST /api/carbon/records
 */
router.post('/records', verifyToken, validateSchema(insertCarbonRecordSchema), async (req, res) => {
  try {
    // Get the session
    const session = await storage.sessionStore.get(req.sessionID);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Create carbon record
    const record = await storage.createCarbonRecord({
      ...req.body,
      userId: new Types.ObjectId(session.userId)
    });
    
    res.status(201).json(record);
  } catch (error) {
    console.error('Create carbon record error:', error);
    res.status(500).json({ message: 'Server error creating carbon record' });
  }
});

/**
 * Get all carbon records for a user
 * GET /api/carbon/:userId
 */
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Check if user is requesting their own data or is an admin
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    
    const records = await storage.getCarbonRecords(userId);
    
    // Calculate total carbon footprint
    const totalFootprint = records.reduce((sum, record) => sum + record.footprintValue, 0);
    
    res.json({
      records,
      totalFootprint,
      recordCount: records.length
    });
  } catch (error) {
    console.error('Get carbon records error:', error);
    res.status(500).json({ message: 'Server error getting carbon records' });
  }
});

/**
 * Get carbon stats and insights
 * GET /api/carbon/stats/:userId
 */
router.get('/stats/:userId', verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Check if user is requesting their own data or is an admin
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    
    const carbonRecords = await storage.getCarbonRecords(userId);
    
    // Calculate total carbon footprint
    const totalFootprint = carbonRecords.reduce((sum, record) => sum + record.footprintValue, 0);
    
    // Group by transport type
    const footprintByTransport: Record<string, number> = {};
    
    for (const record of carbonRecords) {
      if (record.details && typeof record.details === 'object' && 'transportType' in record.details) {
        const transportType = record.details.transportType as string;
        footprintByTransport[transportType] = (footprintByTransport[transportType] || 0) + record.footprintValue;
      }
    }
    
    // Additional stats could be calculated here
    
    res.json({
      totalFootprint,
      recordCount: carbonRecords.length,
      footprintByTransport,
      averagePerTrip: carbonRecords.length ? Math.round(totalFootprint / carbonRecords.length) : 0
    });
  } catch (error) {
    console.error('Get carbon stats error:', error);
    res.status(500).json({ message: 'Server error getting carbon stats' });
  }
});

// Validation schemas
const calculateFootprintSchema = z.object({
  distance: z.number().positive(),
  transportType: z.string(),
  passengers: z.number().int().positive().optional()
});

const compareOptionsSchema = z.object({
  distance: z.number().positive(),
  passengers: z.number().int().positive().optional()
});

// Get all transport options
router.get('/transport-options', async (req, res) => {
  try {
    const options = await getAllTransportOptions();
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transport options' });
  }
});

// Calculate carbon footprint for a specific transport
router.post('/calculate', validateSchema(calculateFootprintSchema), async (req, res) => {
  try {
    const { distance, transportType, passengers } = req.body;
    const result = await calculateCarbonFootprint(distance, transportType, passengers);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Compare all transport options for a given distance
router.post('/compare', validateSchema(compareOptionsSchema), async (req, res) => {
  try {
    const { distance, passengers } = req.body;
    const comparisons = await compareTransportOptions(distance, passengers);
    res.json(comparisons);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;