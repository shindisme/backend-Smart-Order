import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

// tạo payment + update invoice thành paid
export async function insertPaymentModel(data) {
    const { invoice_id, amount, payment_method, payment_channel, payment_reference } = data;
    const payment_id = uuidv7();

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // insert payment
        await connection.query(
            `INSERT INTO payments (
                payment_id, invoice_id, amount, status,
                payment_method, payment_channel, payment_reference,
                created_at, paid_at
             )
             VALUES (?, ?, ?, 1, ?, ?, ?, NOW(), NOW())`,
            [
                payment_id,
                invoice_id,
                amount,
                payment_method,
                payment_channel,
                payment_reference
            ]
        );

        // update invoice thành paid
        await connection.query(
            `UPDATE invoices
             SET status = 'paid', paid_at = NOW()
             WHERE invoice_id = ? AND status = 'pending'`,
            [invoice_id]
        );

        await connection.commit();
        return payment_id;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// lấy tất cả
export async function getAllPaymentsModel(invoice_id) {
    let sql = `
        SELECT 
            p.*,
            i.total AS invoice_total,
            t.name AS table_name
        FROM payments p
        JOIN invoices i ON p.invoice_id = i.invoice_id
        LEFT JOIN tables t ON i.table_id = t.table_id
        WHERE 1=1
    `;

    const params = [];

    // filter theo invoice_id nếu có
    if (invoice_id) {
        sql += ` AND p.invoice_id = ?`;
        params.push(invoice_id);
    }

    sql += ` ORDER BY p.created_at DESC`;

    const [rows] = await pool.query(sql, params);
    return rows;
}

// lấy 1 payment 
export async function getPaymentByIdModel(payment_id) {
    const [rows] = await pool.query(
        `SELECT 
            p.*,
            i.total AS invoice_total,
            i.status AS invoice_status,
            t.name AS table_name
         FROM payments p
         JOIN invoices i ON p.invoice_id = i.invoice_id
         LEFT JOIN tables t ON i.table_id = t.table_id
         WHERE p.payment_id = ?`,
        [payment_id]
    );

    return rows.length > 0 ? rows[0] : null;
}
