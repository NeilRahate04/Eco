import express from 'express';
import { storage } from '../storage';
import { verifyToken } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { userPreferencesSchema } from '@shared/mongodb-schema';
import { Types } from 'mongoose';

const router = express.Router();

/**
 * Get user by ID
 * GET /api/users/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.params.id);
    const currentUserId = new Types.ObjectId(req.user?.id);
    
    // Check if user is requesting their own data or is an admin
    if (!currentUserId.equals(userId) && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user' });
  }
});

/**
 * Update user preferences
 * PUT /api/users/preferences
 */
router.put('/preferences', verifyToken, validateSchema(userPreferencesSchema), async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.user?.id);
    const preferences = req.body;
    
    const updatedUser = await storage.updateUserPreferences(userId, preferences);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ message: 'Server error updating user preferences' });
  }
});

export default router;