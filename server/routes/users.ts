import express from 'express';
import { storage } from '../storage';
import { verifyToken } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { userPreferencesSchema } from '@shared/schema';

const router = express.Router();

/**
 * Get user by ID
 * GET /api/users/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is requesting their own data or is an admin
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user data' });
  }
});

/**
 * Update user preferences
 * PUT /api/users/:id/preferences
 */
router.put('/:id/preferences', verifyToken, validateSchema(userPreferencesSchema), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is updating their own preferences
    if (req.user?.id !== userId) {
      return res.status(403).json({ message: 'Forbidden: Cannot update preferences for another user' });
    }
    
    // Update preferences
    const updatedUser = await storage.updateUserPreferences(userId, req.body);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update preferences' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

export default router;