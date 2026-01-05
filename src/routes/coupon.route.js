import express from 'express';
import * as CouponController from '../controllers/coupon.controller.js';

const router = express.Router();

router.get('/', CouponController.getAllCoupons);
router.post('/', CouponController.insertCoupon);
router.post('/validate', CouponController.validateCoupon);
router.get('/:id', CouponController.getCouponById);
router.put('/:id', CouponController.updateCoupon);
router.delete('/:id', CouponController.deleteCoupon);

export default router;
