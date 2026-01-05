import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

export async function getAllOrdersModel() {
    const [rows] = await pool.query(
        `SELECT o.*, t.name AS table_name, u.fullname AS user_fullname
         FROM orders o
         LEFT JOIN tables t ON o.table_id = t.table_id
         LEFT JOIN users u ON o.user_id = u.user_id
         ORDER BY o.created_at DESC`
    );
    return rows;
}

export async function getOrderDetailModel(order_id) {
    const [orders] = await pool.query(
        `SELECT o.*, t.name AS table_name, u.fullname AS user_fullname
         FROM orders o
         LEFT JOIN tables t ON o.table_id = t.table_id
         LEFT JOIN users u ON o.user_id = u.user_id
         WHERE o.order_id = ?`,
        [order_id]
    );

    if (orders.length === 0) return null;

    const order = orders[0];

    const [items] = await pool.query(
        `SELECT 
            od.order_detail_id,
            od.item_id,
            od.quantity,
            od.total,
            od.note,
            i.name,
            i.price,
            i.img
         FROM order_details od
         INNER JOIN items i ON od.item_id = i.item_id
         WHERE od.order_id = ?`,
        [order_id]
    );

    for (let item of items) {
        const [options] = await pool.query(
            `SELECT o.option_id, o.name, o.plus_price
             FROM options_order_details ood
             INNER JOIN options o ON ood.option_id = o.option_id
             WHERE ood.order_detail_id = ?`,
            [item.order_detail_id]
        );
        item.options = options;
    }

    order.items = items;
    return order;
}

export async function createOrderModel(orderData) {
    const { table_id, user_id, items, note } = orderData;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let invoice_id = null;
        const [existingInvoice] = await connection.query(
            `SELECT invoice_id FROM invoices WHERE table_id = ? AND status = 0 LIMIT 1`,
            [table_id]
        );

        if (existingInvoice.length > 0) {
            invoice_id = existingInvoice[0].invoice_id;
        } else {
            invoice_id = uuidv7();
            await connection.query(
                `INSERT INTO invoices (invoice_id, table_id, total, discount, final_total, status, created_at)
                 VALUES (?, ?, 0, 0, 0, 0, NOW())`,
                [invoice_id, table_id]
            );

            await connection.query(
                `UPDATE tables SET state = 1 WHERE table_id = ?`,
                [table_id]
            );
        }

        const order_id = uuidv7();

        await connection.query(
            `INSERT INTO orders (order_id, invoice_id, table_id, user_id, note, state, created_at)
             VALUES (?, ?, ?, ?, ?, 0, NOW())`,
            [order_id, invoice_id, table_id, user_id || null, note || null]
        );

        for (const item of items) {
            const [existingItems] = await connection.query(
                `SELECT item_id, name, is_deleted FROM items WHERE item_id = ?`,
                [item.item_id]
            );

            if (existingItems.length === 0 || existingItems[0].is_deleted === 1) {
                throw new Error(`Món không tồn tại hoặc đã bị xóa`);
            }

            const detail_id = uuidv7();
            await connection.query(
                `INSERT INTO order_details (order_detail_id, order_id, item_id, quantity, total, note)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [detail_id, order_id, item.item_id, item.quantity, item.total, item.note || null]
            );

            if (item.options && item.options.length > 0) {
                for (const opt of item.options) {
                    if (opt.option_id) {
                        const [existingOptions] = await connection.query(
                            `SELECT option_id FROM options WHERE option_id = ?`,
                            [opt.option_id]
                        );

                        if (existingOptions.length > 0) {
                            await connection.query(
                                `INSERT INTO options_order_details (order_detail_id, option_id)
                                 VALUES (?, ?)`,
                                [detail_id, opt.option_id]
                            );
                        }
                    }
                }
            }
        }

        await connection.query(
            `UPDATE invoices i
             SET i.total = (
                 SELECT COALESCE(SUM(od.total), 0)
                 FROM orders o
                 INNER JOIN order_details od ON o.order_id = od.order_id
                 WHERE o.invoice_id = i.invoice_id
             ),
             i.final_total = i.total - i.discount
             WHERE i.invoice_id = ?`,
            [invoice_id]
        );

        await connection.commit();
        return order_id;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateOrderStateModel(order_id, state) {
    const [result] = await pool.query(
        `UPDATE orders SET state = ? WHERE order_id = ?`,
        [state, order_id]
    );
    return result.affectedRows;
}

export async function deleteOrderModel(order_id) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [order] = await connection.query(
            `SELECT order_id, invoice_id FROM orders WHERE order_id = ? AND state = 0`,
            [order_id]
        );

        if (order.length === 0) {
            await connection.rollback();
            return 0;
        }

        const [details] = await connection.query(
            `SELECT order_detail_id FROM order_details WHERE order_id = ?`,
            [order_id]
        );

        if (details.length > 0) {
            const detailIds = details.map(d => d.order_detail_id);
            await connection.query(
                `DELETE FROM options_order_details WHERE order_detail_id IN (?)`,
                [detailIds]
            );
        }

        await connection.query(`DELETE FROM order_details WHERE order_id = ?`, [order_id]);
        await connection.query(`DELETE FROM orders WHERE order_id = ?`, [order_id]);

        if (order[0].invoice_id) {
            await connection.query(
                `UPDATE invoices i
                 SET i.total = (
                     SELECT COALESCE(SUM(od.total), 0)
                     FROM orders o
                     INNER JOIN order_details od ON o.order_id = od.order_id
                     WHERE o.invoice_id = i.invoice_id
                 ),
                 i.final_total = i.total - i.discount
                 WHERE i.invoice_id = ?`,
                [order[0].invoice_id]
            );

            const [remainingOrders] = await connection.query(
                `SELECT COUNT(*) as count FROM orders WHERE invoice_id = ?`,
                [order[0].invoice_id]
            );

            if (remainingOrders[0].count === 0) {
                const [invoice] = await connection.query(
                    `SELECT table_id FROM invoices WHERE invoice_id = ?`,
                    [order[0].invoice_id]
                );

                await connection.query(`DELETE FROM invoices WHERE invoice_id = ?`, [order[0].invoice_id]);

                if (invoice.length > 0) {
                    await connection.query(`UPDATE tables SET state = 0 WHERE table_id = ?`, [invoice[0].table_id]);
                }
            }
        }

        await connection.commit();
        return 1;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function getOrdersByTableIdModel(table_id) {
    const [rows] = await pool.query(
        `SELECT o.*, t.name AS table_name
         FROM orders o
         LEFT JOIN tables t ON o.table_id = t.table_id
         WHERE o.table_id = ?
         ORDER BY o.created_at DESC`,
        [table_id]
    );
    return rows;
}
