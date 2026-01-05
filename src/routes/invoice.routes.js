import express from 'express';
import * as InvoiceController from '../controllers/invoice.controller.js';

const router = express.Router();

router.get('/pending', InvoiceController.getPendingByTable);
router.get('/pending-orders/:table_id', InvoiceController.getPendingOrders);

router.get('/', InvoiceController.getAllInvoices);
router.get('/:id', InvoiceController.getInvoiceById);
router.post('/', InvoiceController.insertInvoice);
router.patch('/:id/pay', InvoiceController.payInvoice);
router.delete('/:id', InvoiceController.deleteInvoice);

export default router;
