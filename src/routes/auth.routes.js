import express from 'express';
import {
    login,
    logout,
    getUser,
    changePassword
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// /api/auth
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getUser);
router.put('/change-password', verifyToken, changePassword);

export default router;
