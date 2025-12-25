import express from 'express';
import * as PaymentController from '../controllers/payment.controller.js';

const router = express.Router();

// /api/payments
router.get('/', PaymentController.getAllPayments);
router.get('/:id', PaymentController.getPaymentById);
router.post('/', PaymentController.createPayment);

export default router;
