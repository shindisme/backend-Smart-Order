import express from 'express';
import * as OrderController from '../controllers/order.controller.js';

const router = express.Router();

router.get('/', OrderController.getAllOrders);
router.get('/table', OrderController.getOrdersByTableId);
router.get('/:id', OrderController.getOrderDetail);
router.post('/', OrderController.createOrder);
router.patch('/:id', OrderController.updateOrderState);
router.delete('/:id', OrderController.deleteOrder);

export default router;
