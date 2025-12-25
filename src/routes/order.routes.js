import express from 'express';
import * as OrderController from '../controllers/order.controller.js';

const router = express.Router();

// /api/orders
router.get('/', OrderController.getOrdersByInvoiceId);
router.post('/', OrderController.insertOrder);
router.patch('/:id', OrderController.updateOrderState);
router.delete('/:id', OrderController.deleteOrder);

export default router;
