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
    
    // Check if user is requesting their own data or is an admin
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
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
 * PUT /api/users/:id/preferences
 */
router.put('/:id/preferences', verifyToken, validateSchema(userPreferencesSchema), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user is updating their own preferences
    if (req.user?.id !== userId) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update preferences
    const updatedUser = await storage.updateUserPreferences(userId, req.body);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update preferences' });
    }
    
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json({ 
      ...userWithoutPassword,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

export default router;