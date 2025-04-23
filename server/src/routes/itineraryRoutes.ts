import express from 'express';
import { generateItinerary, ItineraryResponse, POI, DayPlan } from '../services/itineraryService';
import { storage } from '../../storage';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const itinerary = await generateItinerary(req.body);
    res.json(itinerary);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

router.post('/export', async (req, res) => {
  try {
    const itinerary = req.body as ItineraryResponse;
    const pdfBuffer = await storage.exportItineraryToPDF(itinerary);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=eco-itinerary.pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting itinerary:', error);
    res.status(500).json({ error: 'Failed to export itinerary' });
  }
});

export default router; 