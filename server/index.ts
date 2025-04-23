import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import { connectDB } from "./db";
import { MongoDBStorage } from "./mongodb-storage";

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for both development and production
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:5375',
  'http://localhost:3000',
  'https://frontend-9hlc.onrender.com',
  'https://eco-9w2a.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Additional CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB, retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Initialize storage and routes
const storage = new MongoDBStorage();
const apiRouter = registerRoutes(app);

// Mount the API router
app.use('/api', apiRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start the server
const startServer = async () => {
  try {
    await connectWithRetry();
    registerRoutes(app);
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
