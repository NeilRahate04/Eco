import express from 'express';
import { storage } from '../storage';
import { verifyToken, isAdmin } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { insertListingSchema } from '@shared/schema';

const router = express.Router();

/**
 * Admin dashboard data
 * GET /api/admin/dashboard
 */
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get all listings
    const listings = await storage.getListings();
    
    // Get all reviews (for demo purposes - not efficient in real world)
    const allReviews = []; 
    const serviceTypes = ['destination', 'transport', 'listing'];
    for (const serviceType of serviceTypes) {
      try {
        const reviews = await storage.getReviews(serviceType, 0);
        allReviews.push(...reviews);
      } catch (error) {
        // Ignore errors in this demo implementation
      }
    }
    
    // Calculate dashboard stats
    const pendingReviews = allReviews.filter(review => !review.approved).length;
    const totalListings = listings.length;
    
    // In a real app, we would add more comprehensive dashboard data
    res.json({
      stats: {
        pendingReviews,
        totalListings,
        totalDestinations: (await storage.getDestinations()).length,
        totalTransportOptions: (await storage.getTransportOptions()).length
      },
      recentListings: listings.slice(0, 5),
      pendingReviewCount: pendingReviews
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error getting dashboard data' });
  }
});

/**
 * Create a new listing
 * POST /api/admin/listings
 */
router.post('/listings', verifyToken, isAdmin, validateSchema(insertListingSchema), async (req, res) => {
  try {
    // Create the listing
    const listing = await storage.createListing(req.body);
    
    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error creating listing' });
  }
});

/**
 * Update a listing
 * PUT /api/admin/listings/:id
 */
router.put('/listings/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    
    // Get the listing
    const listing = await storage.getListing(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Update the listing
    const updatedListing = await storage.updateListing(listingId, req.body);
    if (!updatedListing) {
      return res.status(500).json({ message: 'Failed to update listing' });
    }
    
    res.json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error updating listing' });
  }
});

/**
 * Delete a listing
 * DELETE /api/admin/listings/:id
 */
router.delete('/listings/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    
    // Get the listing
    const listing = await storage.getListing(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Delete the listing
    const deleted = await storage.deleteListing(listingId);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete listing' });
    }
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error deleting listing' });
  }
});

/**
 * Get all listings (admin view with more details)
 * GET /api/admin/listings
 */
router.get('/listings', verifyToken, isAdmin, async (req, res) => {
  try {
    const listings = await storage.getListings();
    res.json(listings);
  } catch (error) {
    console.error('Get all listings error:', error);
    res.status(500).json({ message: 'Server error getting listings' });
  }
});

/**
 * Get a listing by ID (admin view with more details)
 * GET /api/admin/listings/:id
 */
router.get('/listings/:id', verifyToken, isAdmin, async (req, res) => {
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

export default router;