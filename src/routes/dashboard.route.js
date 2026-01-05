import express from 'express';
import * as DashboardController from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/stats', DashboardController.getStats);

export default router;
