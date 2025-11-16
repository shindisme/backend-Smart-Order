import express from 'express';
import * as ItemController from '../controllers/item.controller.js';

const router = express.Router();

// /api/items
router.get('/', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);
router.post('/', ItemController.insertItem);
router.put('/:id', ItemController.updateItem);
router.delete('/:id', ItemController.softDeleteItem);
router.delete('/:id/hard', ItemController.hardDeleteCategory);

export default router;