import express from 'express';
import * as AuthController from '../controllers/auth.controller.js';

const router = express.Router();

// /api/auth/login
router.post('/login', AuthController.login);

export default router;
