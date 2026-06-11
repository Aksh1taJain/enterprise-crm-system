import express from 'express';
import { getCustomers, getCustomerById, convertLeadToCustomer } from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCustomers);

router.route('/convert')
  .post(convertLeadToCustomer);

router.route('/:id')
  .get(getCustomerById);

export default router;
