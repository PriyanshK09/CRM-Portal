import express from 'express';
import { 
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  updateCampaignStats,
  getCampaignStats
} from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect routes that need authentication
router.use((req, res, next) => {
  // Skip authentication for POST requests during development
  if (process.env.NODE_ENV !== 'production' && req.method === 'POST') {
    return next();
  }
  
  // Apply protection for all other routes
  protect(req, res, next);
});

// Campaign routes
router.route('/')
  .get(getCampaigns)
  .post(createCampaign);

router.route('/stats')
  .get(getCampaignStats);

router.route('/:id')
  .get(getCampaignById)
  .put(updateCampaign)
  .delete(deleteCampaign);

router.route('/:id/stats')
  .put(updateCampaignStats);

export default router;