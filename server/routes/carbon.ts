import express from 'express';
import { storage } from '../storage';
import { verifyToken } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { insertCarbonRecordSchema } from '@shared/schema';

const router = express.Router();

/**
 * Record carbon footprint
 * POST /api/carbon
 */
router.post('/', verifyToken, validateSchema(insertCarbonRecordSchema), async (req, res) => {
  try {
    // Set user ID from authenticated user
    const carbonData = {
      ...req.body,
      userId: req.user?.id!
    };
    
    // Create carbon record
    const record = await storage.createCarbonRecord(carbonData);
    
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

export default router;