import express from 'express';
import * as OrderDetailController from '../controllers/orderDetail.controller.js';

const router = express.Router();

// /api/order-details
router.get('/', OrderDetailController.getAllOrderDetails);
router.get('/:id', OrderDetailController.getOrderDetailById);
router.post('/', OrderDetailController.insertOrderDetail);
router.put('/:id', OrderDetailController.updateOrderDetail);
router.delete('/:id', OrderDetailController.deleteOrderDetail);

export default router;
