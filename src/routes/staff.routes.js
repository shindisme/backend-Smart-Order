import express from 'express';
import * as StaffController from '../controllers/staff.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAdmin);

// /api/staffs
router.get('/', StaffController.getAllStaffs);
router.get('/:id', StaffController.getStaffById);
router.post('/', StaffController.insertStaff);
router.put('/:id', StaffController.updateStaff);
router.delete('/:id', StaffController.deleteStaff);
router.post('/:id/reset-password', StaffController.resetStaffPassword);

export default router;
