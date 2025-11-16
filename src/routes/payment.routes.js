import express from 'express';
import * as PaymentController from '../controllers/payment.controller.js';

const router = express.Router();

// /api/payments
router.get('/', PaymentController.getAllPayments);
router.get('/:id', PaymentController.getPaymentById);
router.post('/', PaymentController.insertPayment);
router.put('/:id', PaymentController.updatePayment);
router.delete('/:id', PaymentController.deletePayment);

export default router;
