import express from 'express';
import * as InvoiceController from '../controllers/invoice.controller.js';

const router = express.Router();

// /api/invoices
router.get('/', InvoiceController.getAllInvoices);
router.get('/:id', InvoiceController.getInvoiceById);
router.post('/', InvoiceController.insertInvoice);
router.patch('/:id', InvoiceController.updateInvoice);
router.delete('/:id', InvoiceController.deleteInvoice);

export default router;
