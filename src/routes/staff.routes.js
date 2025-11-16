import express from 'express';
import * as StaffController from '../controllers/staff.controller.js';

const router = express.Router();

// /api/staff
router.get('/', StaffController.getAllStaff);
router.get('/:id', StaffController.getStaffById);
router.post('/', StaffController.insertStaff);
router.put('/:id', StaffController.updateStaff);
router.delete('/:id', StaffController.deleteStaff);

export default router;
