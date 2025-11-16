import express from 'express';
import * as OrderController from '../controllers/order.controller.js';

const router = express.Router();

// /api/orders
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.insertOrder);
router.put('/:id', OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);

export default router;
