import express from 'express';
import authRouter from './auth';
import userRouter from './users';
import carbonRouter from './carbon';
import { initializeTransportData } from '../services/carbonCalculator';

// Initialize transport data
initializeTransportData();

export function registerRoutes(app: express.Express) {
  // Mount routes
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/carbon', carbonRouter);
} 