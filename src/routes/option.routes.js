import express from 'express';
import * as OptionController from '../controllers/option.controller.js';

const router = express.Router();

// /api/options
router.get('/', OptionController.getAllOptions);
router.get('/:id', OptionController.getOptionById);
router.post('/', OptionController.insertOption);
router.put('/:id', OptionController.updateOption);
router.delete('/:id', OptionController.deleteOption);

export default router;
