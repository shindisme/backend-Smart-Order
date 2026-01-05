import express from 'express';
import * as InvoiceController from '../controllers/invoice.controller.js';

const router = express.Router();

router.get('/', InvoiceController.getAllInvoices);
router.get('/:id', InvoiceController.getInvoiceById);
router.patch('/:id/pay', InvoiceController.payInvoice);

export default router;
