import express from 'express';
import { storage } from '../storage';

const router = express.Router();

/**
 * Get all listings
 * GET /api/listings
 */
router.get('/', async (req, res) => {
  try {
    const listings = await storage.getListings();
    res.json(listings);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error getting listings' });
  }
});

/**
 * Get a listing by ID
 * GET /api/listings/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    
    const listing = await storage.getListing(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Server error getting listing' });
  }
});

/**
 * Get listings by type
 * GET /api/listings/type/:type
 */
router.get('/type/:type', async (req, res) => {
  try {
    const listingType = req.params.type;
    
    const allListings = await storage.getListings();
    const filteredListings = allListings.filter(listing => 
      listing.type.toLowerCase() === listingType.toLowerCase()
    );
    
    res.json(filteredListings);
  } catch (error) {
    console.error('Get listings by type error:', error);
    res.status(500).json({ message: 'Server error getting listings by type' });
  }
});

/**
 * Get listings by location
 * GET /api/listings/location/:location
 */
router.get('/location/:location', async (req, res) => {
  try {
    const location = req.params.location;
    
    const allListings = await storage.getListings();
    const filteredListings = allListings.filter(listing => 
      listing.location.toLowerCase().includes(location.toLowerCase())
    );
    
    res.json(filteredListings);
  } catch (error) {
    console.error('Get listings by location error:', error);
    res.status(500).json({ message: 'Server error getting listings by location' });
  }
});

export default router;