import express from 'express';
import { storage } from '../storage';
import { validateSchema } from '../middleware/validate';
import { registerSchema, loginSchema } from '@shared/mongodb-schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/auth';
import { Types } from 'mongoose';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

const router = express.Router();

/**
 * User registration route
 * POST /api/auth/register
 */
router.post('/register', validateSchema(registerSchema), async (req, res) => {
  try {
    console.log('Registration request received:', { body: { ...req.body, password: '[REDACTED]' } });
    
    // Create new user using storage implementation
    // The storage layer handles password hashing and validation
    const user = await storage.createUser(req.body);
    console.log('User created successfully:', { id: user._id.toString(), username: user.username });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = user;
    
    // Convert MongoDB document to plain object and ensure _id is a string
    const userResponse = {
      ...userWithoutPassword,
      _id: userWithoutPassword._id.toString()
    };
    
    res.status(201).json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: fromZodError(error).message
      });
    }
    
    // Handle known error messages
    if (error instanceof Error) {
      if (error.message === 'Username already exists') {
        return res.status(400).json({ 
          message: error.message,
          field: 'username'
        });
      }
      if (error.message === 'Email already exists') {
        return res.status(400).json({ 
          message: error.message,
          field: 'email'
        });
      }
      if (error.message === 'Passwords do not match') {
        return res.status(400).json({ 
          message: error.message,
          field: 'confirmPassword'
        });
      }
    }
    
    // Generic server error
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * User login route
 * POST /api/auth/login
 */
router.post('/login', validateSchema(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    
    // Don't send the password in the response
    const { password: _, ...userWithoutPassword } = user;
    
    // Convert MongoDB document to plain object and ensure _id is a string
    const userResponse = {
      ...userWithoutPassword,
      _id: userWithoutPassword._id.toString()
    };
    
    res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * Logout route
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  // In a token-based auth system, the client is responsible for discarding the token
  // Here we just return a success message
  res.json({ message: 'Logged out successfully' });
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }
    
    const userId = new Types.ObjectId(req.user.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = user;
    
    // Convert MongoDB document to plain object and ensure _id is a string
    const userResponse = {
      ...userWithoutPassword,
      _id: userWithoutPassword._id.toString()
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error getting current user' });
  }
});

export default router;