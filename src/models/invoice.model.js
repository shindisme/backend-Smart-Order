import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

// Lấy tất cả invoices
export async function getAllInvoicesModel() {
    const [rows] = await pool.query(
        `SELECT 
            i.*,
            t.name AS table_name,
            c.code AS coupon_code
         FROM invoices i
         LEFT JOIN tables t ON i.table_id = t.table_id
         LEFT JOIN coupons c ON i.coupon_id = c.coupon_id
         ORDER BY i.created_at DESC`
    );
    return rows;
}

// Lấy 1 invoice + orders
export async function getInvoiceByIdModel(invoice_id) {
    const [inv] = await pool.query(
        `SELECT i.*, t.name AS table_name, c.code AS coupon_code
         FROM invoices i
         LEFT JOIN tables t ON i.table_id = t.table_id
         LEFT JOIN coupons c ON i.coupon_id = c.coupon_id
         WHERE i.invoice_id = ?`,
        [invoice_id]
    );

    if (inv.length === 0) return null;

    const [orders] = await pool.query(
        `SELECT o.* FROM orders o WHERE o.invoice_id = ?`,
        [invoice_id]
    );

    return { ...inv[0], orders };
}

// ✅ NEW: Lấy invoice pending của bàn
export async function getPendingInvoiceByTableModel(table_id) {
    const [rows] = await pool.query(
        `SELECT 
            i.*,
            t.name AS table_name,
            c.code AS coupon_code,
            COUNT(o.order_id) AS order_count
         FROM invoices i
         LEFT JOIN tables t ON i.table_id = t.table_id
         LEFT JOIN coupons c ON i.coupon_id = c.coupon_id
         LEFT JOIN orders o ON i.invoice_id = o.invoice_id
         WHERE i.table_id = ? AND i.status = 0
         GROUP BY i.invoice_id
         ORDER BY i.created_at DESC
         LIMIT 1`,
        [table_id]
    );

    return rows[0] || null;
}

// Lấy orders chưa thanh toán của 1 bàn
export async function getPendingOrdersModel(table_id) {
    const [rows] = await pool.query(
        `SELECT * FROM orders 
         WHERE table_id = ? AND state = 2 AND invoice_id IS NULL`,
        [table_id]
    );
    return rows;
}

// Tạo invoice
export async function insertInvoiceModel(data) {
    const invoice_id = uuidv7();
    await pool.query(
        `INSERT INTO invoices (invoice_id, table_id, coupon_id, total, discount, final_total, status)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [invoice_id, data.table_id, data.coupon_id || null, data.total, data.discount || 0, data.final_total]
    );
    return invoice_id;
}

// Thanh toán
export async function payInvoiceModel(invoice_id) {
    const [result] = await pool.query(
        `UPDATE invoices SET status = 1, paid_at = NOW() WHERE invoice_id = ? AND status = 0`,
        [invoice_id]
    );
    return result.affectedRows;
}

// Xóa
export async function deleteInvoiceModel(invoice_id) {
    const [result] = await pool.query(
        `DELETE FROM invoices WHERE invoice_id = ? AND status = 0`,
        [invoice_id]
    );
    return result.affectedRows;
}
