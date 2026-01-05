import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

export async function getAllCouponsModel() {
    const [rows] = await pool.query(
        `SELECT * FROM coupons
         WHERE is_deleted = 0`
    );
    return rows;
}

export async function getCouponByIdModel(coupon_id) {
    const [rows] = await pool.query(
        `SELECT * FROM coupons WHERE coupon_id = ?`,
        [coupon_id]
    );
    return rows[0];
}

export async function checkCouponCodeExistsModel(code, excludeId = null) {
    const query = excludeId
        ? `SELECT coupon_id FROM coupons WHERE code = ? AND coupon_id != ? AND is_deleted = 0`
        : `SELECT coupon_id FROM coupons WHERE code = ? AND is_deleted = 0`;

    const params = excludeId ? [code, excludeId] : [code];
    const [rows] = await pool.query(query, params);
    return rows.length > 0;
}

export async function insertCouponModel(data) {
    const coupon_id = uuidv7();
    const {
        code, description, type, value,
        min_amount, max_discount,
        start_date, end_date,
        usage_limit, state
    } = data;

    await pool.query(
        `INSERT INTO coupons (
            coupon_id, code, description, type, value,
            min_amount, max_discount,
            start_date, end_date,
            usage_limit, used_count, state, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0)`,
        [
            coupon_id, code, description || null, type, value,
            min_amount || 0, max_discount || null,
            start_date, end_date,
            usage_limit || null, state
        ]
    );

    return coupon_id;
}

export async function updateCouponModel(coupon_id, data) {
    const {
        code, description, type, value,
        min_amount, max_discount,
        start_date, end_date,
        usage_limit, state
    } = data;

    const [result] = await pool.query(
        `UPDATE coupons SET
            code = ?, description = ?, type = ?, value = ?,
            min_amount = ?, max_discount = ?,
            start_date = ?, end_date = ?,
            usage_limit = ?, state = ?
         WHERE coupon_id = ?`,
        [
            code, description || null, type, value,
            min_amount || 0, max_discount || null,
            start_date, end_date,
            usage_limit || null, state,
            coupon_id
        ]
    );

    return result.affectedRows;
}

export async function deleteCouponModel(coupon_id) {
    const [result] = await pool.query(
        `UPDATE coupons SET is_deleted = 1 WHERE coupon_id = ?`,
        [coupon_id]
    );
    return result.affectedRows;
}

export async function validateCouponModel(code, totalAmount) {
    const [rows] = await pool.query(
        `SELECT * FROM coupons
         WHERE code = ?
         AND state = 1
         AND is_deleted = 0
         AND start_date <= CURDATE()
         AND end_date >= CURDATE()
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [code]
    );

    if (rows.length === 0) {
        return { valid: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' };
    }

    const coupon = rows[0];

    // Kiểm tra đơn tối thiểu
    if (coupon.min_amount > totalAmount) {
        return {
            valid: false,
            message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(coupon.min_amount)}đ`
        };
    }

    // Tính discount
    let discount = 0;
    if (coupon.type === 0) {
        // giảm %
        discount = Math.floor(totalAmount * coupon.value / 100);
        if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
        }
    } else {
        // giảm tiền
        discount = coupon.value;
    }

    return {
        valid: true,
        coupon,
        discount
    };
}
