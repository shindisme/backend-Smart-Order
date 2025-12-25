import express from 'express';
import * as CategoryController from '../controllers/category.controller.js';

const router = express.Router();

// /api/categories
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', CategoryController.insertCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
