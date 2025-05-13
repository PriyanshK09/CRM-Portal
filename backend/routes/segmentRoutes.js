import express from 'express';
import { 
  getSegments,
  getSegmentById,
  createSegment,
  updateSegment,
  deleteSegment,
  getSegmentCustomers,
  calculateAudience
} from '../controllers/segmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Segment routes
router.route('/')
  .get(getSegments)
  .post(createSegment);

router.route('/calculate-audience')
  .post(calculateAudience);

router.route('/:id')
  .get(getSegmentById)
  .put(updateSegment)
  .delete(deleteSegment);

router.route('/:id/customers')
  .get(getSegmentCustomers);

export default router;