import express from 'express';
import * as TableController from '../controllers/table.controller.js';

const router = express.Router();

// /api/tables
router.get('/', TableController.getAllTables);
router.get('/:id', TableController.getTableById);
router.post('/', TableController.insertTable);
router.put('/:id', TableController.updateTable);
router.delete('/:id', TableController.deleteTable);

export default router;
