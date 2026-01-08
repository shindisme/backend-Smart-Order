import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

export async function getAllInvoicesModel() {
    try {
        const [rows] = await pool.query(
            `SELECT 
                i.*,
                t.name as table_name
             FROM invoices i
             LEFT JOIN tables t ON i.table_id = t.table_id
             ORDER BY i.created_at DESC`
        );
        return rows;
    } catch (error) {
        throw error;
    }
}

export async function getInvoiceByIdModel(invoice_id) {
    try {

        const [invoices] = await pool.query(
            `SELECT 
                i.*,
                t.name as table_name
             FROM invoices i
             LEFT JOIN tables t ON i.table_id = t.table_id
             WHERE i.invoice_id = ?`,
            [invoice_id]
        );

        if (invoices.length === 0) {
            return null;
        }

        const invoice = invoices[0];

        const [orders] = await pool.query(
            `SELECT o.order_id, o.state, o.created_at, o.note
             FROM orders o
             WHERE o.invoice_id = ?
             ORDER BY o.created_at ASC`,
            [invoice_id]
        );

        for (const order of orders) {
            const [items] = await pool.query(
                `SELECT 
                    od.order_detail_id,
                    od.quantity,
                    od.total,
                    od.note,
                    i.item_id,
                    i.name,
                    i.img,
                    i.price
                 FROM order_details od
                 INNER JOIN items i ON od.item_id = i.item_id
                 WHERE od.order_id = ?`,
                [order.order_id]
            );

            for (const item of items) {
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
        }

        if (invoice.coupon_id) {
            const [coupons] = await pool.query(
                `SELECT coupon_id, code, description, type, value, max_discount
                 FROM coupons
                 WHERE coupon_id = ?`,
                [invoice.coupon_id]
            );
            invoice.coupon = coupons[0] || null;
        }

        invoice.orders = orders;

        return invoice;
    } catch (error) {
        throw error;
    }
}

export async function getPendingInvoiceByTableModel(table_id) {
    const [rows] = await pool.query(
        `SELECT invoice_id FROM invoices
         WHERE table_id = ? AND status = 0
         ORDER BY created_at DESC
         LIMIT 1`,
        [table_id]
    );
    return rows[0];
}

export async function createInvoiceModel(table_id) {
    const invoice_id = uuidv7();

    await pool.query(
        `INSERT INTO invoices (invoice_id, table_id, total, discount, final_total, status, created_at)
         VALUES (?, ?, 0, 0, 0, 0, NOW())`,
        [invoice_id, table_id]
    );

    await pool.query(
        `UPDATE tables SET state = 1 WHERE table_id = ?`,
        [table_id]
    );

    return invoice_id;
}

export async function updateInvoiceTotalModel(invoice_id) {
    await pool.query(
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
}

export async function payInvoiceModel(invoice_id, coupon_code) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [invoice] = await connection.query(
            `SELECT invoice_id, table_id, total FROM invoices WHERE invoice_id = ? AND status = 0`,
            [invoice_id]
        );

        if (invoice.length === 0) {
            throw new Error('Hóa đơn không tồn tại hoặc đã thanh toán');
        }

        let discount = 0;
        let coupon_id = null;

        if (coupon_code) {
            const [coupons] = await connection.query(
                `SELECT * FROM coupons
                 WHERE code = ? AND state = 1 AND is_deleted = 0
                 AND start_date <= CURDATE() AND end_date >= CURDATE()
                 AND (usage_limit IS NULL OR used_count < usage_limit)`,
                [coupon_code]
            );

            if (coupons.length > 0) {
                const coupon = coupons[0];

                if (invoice[0].total >= coupon.min_amount) {
                    if (coupon.type === 0) {
                        discount = Math.floor(invoice[0].total * coupon.value / 100);
                        if (coupon.max_discount && discount > coupon.max_discount) {
                            discount = coupon.max_discount;
                        }
                    } else {
                        discount = coupon.value;
                    }

                    coupon_id = coupon.coupon_id;

                    await connection.query(
                        `UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = ?`,
                        [coupon_id]
                    );
                }
            }
        }

        await connection.query(
            `UPDATE invoices 
             SET status = 1, coupon_id = ?, discount = ?, final_total = total - ?, paid_at = NOW() 
             WHERE invoice_id = ?`,
            [coupon_id, discount, discount, invoice_id]
        );

        await connection.query(
            `UPDATE tables SET state = 0 WHERE table_id = ?`,
            [invoice[0].table_id]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
