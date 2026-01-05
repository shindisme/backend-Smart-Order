import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

export async function insertPaymentModel(data) {
    const { invoice_id, amount, payment_method, payment_channel, payment_reference } = data;
    const payment_id = uuidv7();

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

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

export async function createPendingPaymentModel(invoice_id, amount) {
    const payment_id = uuidv7();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            `INSERT INTO payments (
                payment_id, invoice_id, amount, status,
                payment_method, payment_channel, payment_reference,
                created_at, paid_at
            )
            VALUES (?, ?, ?, 0, 'vnpay', 'online', NULL, NOW(), NULL)`,
            [payment_id, invoice_id, amount]
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

// update payment success
export async function updatePaymentSuccessModel(payment_id, vnp_TransactionNo) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // update payments
        await connection.query(
            `UPDATE payments
             SET status = 1,
                 payment_reference = ?,
                 paid_at = NOW()
             WHERE payment_id = ?`,
            [vnp_TransactionNo || null, payment_id]
        );

        // update invoice = paid
        await connection.query(
            `UPDATE invoices i
             JOIN payments p ON i.invoice_id = p.invoice_id
             SET i.status = 1,
                 i.paid_at = NOW()
             WHERE p.payment_id = ?`,
            [payment_id]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// update payment failed
export async function updatePaymentFailedModel(payment_id) {
    await pool.query(
        `UPDATE payments
         SET status = 2
         WHERE payment_id = ?`,
        [payment_id]
    );
}
