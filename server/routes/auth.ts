import express from 'express';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '@shared/schema';
import { storage } from '../storage';
import { validateSchema } from '../middleware/validate';
import { generateToken } from '../middleware/auth';

const router = express.Router();

/**
 * User registration route
 * POST /api/auth/register
 */
router.post('/register', validateSchema(registerSchema), async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    // Generate JWT token
    const token = generateToken({ id: user.id, role: user.role });

    // Return user without password and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, token });
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, role: user.role });

    // Return user without password and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
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
  // In a real app with cookies, we would clear the cookie here
  res.json({ message: 'Logged out successfully' });
});

export default router;