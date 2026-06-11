import express from 'express';
import { exportLeads, exportDeals, exportCustomers } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/export-leads', exportLeads);
router.get('/export-deals', exportDeals);
router.get('/export-customers', exportCustomers);

export default router;
