import express from 'express';

import itemRoutes from './item.routes.js';
import categoryRoutes from './category.routes.js';
import orderRoutes from './order.routes.js';
import orderDetailRoutes from './orderDetail.routes.js';
import tableRoutes from './table.routes.js';
import staffRoutes from './staff.routes.js';
import authRoutes from './auth.routes.js';
import invoiceRoutes from './invoice.routes.js';
import paymentRoutes from './payment.routes.js';
import optionGroupRoutes from './optionGroup.routes.js';
import optionRoutes from './option.routes.js';
import couponRoutes from './coupon.route.js';
import dashboardRoutes from './dashboard.route.js';

const router = express.Router();

export function AppRouter(app) {
    router.use('/items', itemRoutes);
    router.use('/categories', categoryRoutes);
    router.use('/orders', orderRoutes);
    router.use('/order-details', orderDetailRoutes);
    router.use('/tables', tableRoutes);
    router.use('/staffs', staffRoutes);
    router.use('/auth', authRoutes);
    router.use('/invoices', invoiceRoutes);
    router.use('/payments', paymentRoutes);
    router.use('/option-groups', optionGroupRoutes);
    router.use('/options', optionRoutes);
    router.use('/coupons', couponRoutes);
    router.use('/dashboard', dashboardRoutes);

    app.use('/api/v1', router);
};
