import express from 'express';
import { storage } from '../storage';
import { validateSchema } from '../middleware/validate';
import { registerSchema, loginSchema } from '@shared/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

/**
 * User registration route
 * POST /api/auth/register
 */
router.post('/register', validateSchema(registerSchema), async (req, res) => {
  try {
    const { confirmPassword, ...userData } = req.body;
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create new user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user' // Default to 'user' role
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * User login route
 * POST /api/auth/login
 */
router.post('/login', validateSchema(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    
    // Don't send the password in the response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
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
 * Get current user info
 * GET /api/auth/me
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Get user from storage
    const user = await storage.getUser(req.user?.id!);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error getting user info' });
  }
});

export default router;