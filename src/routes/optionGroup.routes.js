import express from 'express';
import * as OptionGroupController from '../controllers/optionGroup.controller.js';

const router = express.Router();

// /api/option-groups
router.get('/', OptionGroupController.getAllOptionGroups);
router.get('/:id', OptionGroupController.getOptionGroupById);
router.post('/', OptionGroupController.insertOptionGroup);
router.put('/:id', OptionGroupController.updateOptionGroup);
router.delete('/:id', OptionGroupController.deleteOptionGroup);

export default router;
