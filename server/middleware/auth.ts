import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// This would typically come from an environment variable
// Using a placeholder value for now
const JWT_SECRET = process.env.JWT_SECRET || 'ecotravel-secret-key';

// Define request type with user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token and add user to request object
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from Authorization header or cookies
    const token = 
      req.headers.authorization?.split(' ')[1] || 
      req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }

      // Add user data to request
      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized: Authentication failed' });
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  next();
};

/**
 * Utility to generate JWT token
 */
export const generateToken = (user: { id: number; role: string }) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};