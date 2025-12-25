import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

// tạo order + order details
export async function insertOrderModel(data) {
    const { invoice_id, table_id, service_id, items, note } = data;
    const order_id = uuidv7();

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // tính tổng tiền order
        let total_amount = 0;
        for (const item of items) {
            total_amount += item.total;
        }

        // insert order
        await connection.query(
            `INSERT INTO orders (
                order_id, table_id, service_id, invoice_id,
                state, total_amount, note
             )
             VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
            [order_id, table_id, service_id || null, invoice_id, total_amount, note || null]
        );

        // insert order details
        for (const item of items) {
            const detail_id = uuidv7();

            await connection.query(
                `INSERT INTO order_details (
                    order_detail_id, item_id, order_id,
                    quantity, total, note
                 )
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    detail_id,
                    item.item_id,
                    order_id,
                    item.quantity,
                    item.total,
                    item.note || null
                ]
            );

            // insert options nếu có
            if (item.options && item.options.length > 0) {
                for (const option of item.options) {
                    await connection.query(
                        `INSERT INTO options_order_details (order_detail_id, option_id)
                         VALUES (?, ?)`,
                        [detail_id, option.option_id]
                    );
                }
            }
        }

        await connection.commit();
        return order_id;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// lấy orders theo invoice_id
export async function getOrdersByInvoiceIdModel(invoice_id) {
    const [rows] = await pool.query(
        `SELECT 
            o.*,
            s.name AS service_name
         FROM orders o
         LEFT JOIN services s ON o.service_id = s.service_id
         WHERE o.invoice_id = ?
         ORDER BY o.created_at DESC`,
        [invoice_id]
    );

    return rows;
}

// update state của order
export async function updateOrderStateModel(order_id, state) {
    const [rows] = await pool.query(
        `UPDATE orders
         SET state = ?
         WHERE order_id = ?`,
        [state, order_id]
    );

    return rows.affectedRows;
}

// xóa order (chỉ khi pending)
export async function deleteOrderModel(order_id) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // lấy order_detail_ids
        const [detailRows] = await connection.query(
            `SELECT order_detail_id
             FROM order_details
             WHERE order_id = ?`,
            [order_id]
        );

        const detailIds = detailRows.map(d => d.order_detail_id);

        // xóa options_order_details
        if (detailIds.length > 0) {
            await connection.query(
                `DELETE FROM options_order_details
                 WHERE order_detail_id IN (?)`,
                [detailIds]
            );
        }

        // xóa order_details
        await connection.query(
            `DELETE FROM order_details
             WHERE order_id = ?`,
            [order_id]
        );

        // xóa order (chỉ pending)
        const [result] = await connection.query(
            `DELETE FROM orders
             WHERE order_id = ? AND state = 'pending'`,
            [order_id]
        );

        await connection.commit();
        return result.affectedRows;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
