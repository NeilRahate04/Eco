import express from 'express';
import { storage } from '../storage';
import { verifyToken, isAdmin } from '../middleware/auth';
import { validateSchema } from '../middleware/validate';
import { insertReviewSchema } from '@shared/schema';

const router = express.Router();

/**
 * Create a new review
 * POST /api/reviews
 */
router.post('/', verifyToken, validateSchema(insertReviewSchema), async (req, res) => {
  try {
    // Set user ID from authenticated user
    const reviewData = {
      ...req.body,
      userId: req.user?.id!,
      approved: req.user?.role === 'admin' // Auto-approve if admin
    };
    
    // Create the review
    const review = await storage.createReview(reviewData);
    
    res.status(201).json({ 
      ...review,
      message: review.approved ? 
        'Review published successfully' : 
        'Review submitted successfully and pending approval'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
});

/**
 * Get reviews for a destination
 * GET /api/reviews/destination/:destination
 */
router.get('/destination/:destination', async (req, res) => {
  try {
    const destination = req.params.destination;
    const reviews = await storage.getDestinationReviews(destination);
    
    // Only return approved reviews to the public
    const approvedReviews = reviews.filter(review => review.approved);
    
    res.json(approvedReviews);
  } catch (error) {
    console.error('Get destination reviews error:', error);
    res.status(500).json({ message: 'Server error getting destination reviews' });
  }
});

/**
 * Get reviews for a service type and ID
 * GET /api/reviews/:serviceType/:serviceId
 */
router.get('/:serviceType/:serviceId', async (req, res) => {
  try {
    const serviceType = req.params.serviceType;
    const serviceId = parseInt(req.params.serviceId);
    
    const reviews = await storage.getReviews(serviceType, serviceId);
    
    // Only return approved reviews to the public
    const approvedReviews = reviews.filter(review => review.approved);
    
    res.json(approvedReviews);
  } catch (error) {
    console.error('Get service reviews error:', error);
    res.status(500).json({ message: 'Server error getting service reviews' });
  }
});

/**
 * Approve a review (admin only)
 * PUT /api/reviews/:id/approve
 */
router.put('/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // Get the review
    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Approve the review
    const approvedReview = await storage.approveReview(reviewId);
    if (!approvedReview) {
      return res.status(500).json({ message: 'Failed to approve review' });
    }
    
    res.json({ 
      ...approvedReview,
      message: 'Review approved successfully'
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Server error approving review' });
  }
});

/**
 * Get all pending reviews (admin only)
 * GET /api/reviews/pending
 */
router.get('/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    // This is just a demonstration - in a real app we'd have a more efficient way to query pending reviews
    // Get all reviews from the storage (for demo purposes)
    const allReviews = []; 
    
    // Iterate through all serviceTypes and perform getReviews for each
    // This is just a workaround since our storage doesn't have a direct getAllReviews method
    const serviceTypes = ['destination', 'transport', 'listing'];
    for (const serviceType of serviceTypes) {
      // We just need a dummy ID to call the getReviews method
      // In a real database implementation, we would have a proper query
      try {
        const reviews = await storage.getReviews(serviceType, 0);
        allReviews.push(...reviews);
      } catch (error) {
        // Ignore errors in this demo implementation
      }
    }
    
    // Filter for pending reviews
    const pendingReviews = allReviews.filter(review => !review.approved);
    
    res.json(pendingReviews);
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ message: 'Server error getting pending reviews' });
  }
});

export default router;