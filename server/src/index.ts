import express from 'express';
import cors from 'cors';
import itineraryRoutes from './routes/itineraryRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/itinerary', itineraryRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 