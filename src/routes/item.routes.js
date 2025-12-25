import express from 'express';
import * as ItemController from '../controllers/item.controller.js';
import { uploadItemImg } from '../middlewares/upload.js';

const router = express.Router();

// /api/items
router.get('/', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);
router.post("/", uploadItemImg.single("img"), ItemController.insertItem);
router.patch("/:id", uploadItemImg.single("img"), ItemController.updateItem);
router.delete('/:id', ItemController.deleteItem);

export default router;