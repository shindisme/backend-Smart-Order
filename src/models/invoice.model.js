import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

// lấy tất cả invoices
export async function getAllInvoicesModel() {
    const [rows] = await pool.query(
        `SELECT 
            i.*,
            t.name AS table_name,
            c.code AS coupon_code,
            COUNT(DISTINCT o.order_id) AS order_count,
            SUM(o.total_amount) AS total_orders_amount
         FROM invoices i
         LEFT JOIN tables t ON i.table_id = t.table_id
         LEFT JOIN coupons c ON i.coupon_id = c.coupon_id
         LEFT JOIN orders o ON i.invoice_id = o.invoice_id
         GROUP BY i.invoice_id
         ORDER BY i.created_at DESC`
    );

    return rows;
}

// lấy 1 invoice có chi tiết orders
export async function getInvoiceByIdModel(invoice_id) {
    // lấy thông tin invoice
    const [invoiceRows] = await pool.query(
        `SELECT 
            i.*,
            t.name AS table_name,
            t.qr_code AS table_qr_code,
            c.code AS coupon_code,
            c.value AS coupon_value,
            c.type AS coupon_type
         FROM invoices i
         LEFT JOIN tables t ON i.table_id = t.table_id
         LEFT JOIN coupons c ON i.coupon_id = c.coupon_id
         WHERE i.invoice_id = ?`,
        [invoice_id]
    );

    if (invoiceRows.length === 0) return null;

    const invoice = invoiceRows[0];

    // lấy tất cả orders của invoice
    const [orderRows] = await pool.query(
        `SELECT 
            o.*,
            s.name AS service_name
         FROM orders o
         LEFT JOIN services s ON o.service_id = s.service_id
         WHERE o.invoice_id = ?
         ORDER BY o.created_at ASC`,
        [invoice_id]
    );

    if (orderRows.length === 0) {
        return {
            ...invoice,
            orders: []
        };
    }

    // lấy chi tiết items của từng order
    const orderIds = orderRows.map(o => o.order_id);
    const [detailRows] = await pool.query(
        `SELECT 
            od.*,
            i.name AS item_name,
            i.img AS item_img
         FROM order_details od
         JOIN items i ON od.item_id = i.item_id
         WHERE od.order_id IN (?)`,
        [orderIds]
    );

    // lấy options của từng order_detail
    const detailIds = detailRows.map(d => d.order_detail_id);
    let optionRows = [];

    if (detailIds.length > 0) {
        [optionRows] = await pool.query(
            `SELECT 
                odo.*,
                opt.name AS option_name,
                opt.plus_price
             FROM options_order_details odo
             JOIN options opt ON odo.option_id = opt.option_id
             WHERE odo.order_detail_id IN (?)`,
            [detailIds]
        );
    }

    // gộp options vào details
    const detailsWithOptions = detailRows.map(detail => ({
        ...detail,
        options: optionRows
            .filter(opt => opt.order_detail_id === detail.order_detail_id)
            .map(opt => ({
                option_id: opt.option_id,
                name: opt.option_name,
                plus_price: opt.plus_price
            }))
    }));

    // gộp details vào orders
    const orders = orderRows.map(order => ({
        ...order,
        items: detailsWithOptions.filter(d => d.order_id === order.order_id)
    }));

    return {
        ...invoice,
        orders
    };
}

// tạo invoice mới
export async function insertInvoiceModel(data) {
    const { table_id, coupon_id, total, discount, final_total } = data;
    const invoice_id = uuidv7();

    await pool.query(
        `INSERT INTO invoices (invoice_id, table_id, coupon_id, total, discount, final_total, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
            invoice_id,
            table_id || null,
            coupon_id || null,
            total || 0,
            discount || 0,
            final_total || 0
        ]
    );

    return invoice_id;
}

// update invoice (discount, coupon, total...)
export async function updateInvoiceModel(invoice_id, data) {
    const { coupon_id, discount, total, final_total } = data;

    const [rows] = await pool.query(
        `UPDATE invoices
         SET coupon_id = COALESCE(?, coupon_id),
             discount = COALESCE(?, discount),
             total = COALESCE(?, total),
             final_total = COALESCE(?, final_total)
         WHERE invoice_id = ? AND status = 'pending'`,
        [coupon_id, discount, total, final_total, invoice_id]
    );

    return rows.affectedRows;
}

// update tổng tiền khi thêm order mới
export async function updateInvoiceTotalModel(invoice_id) {
    // tính lại total từ tất cả orders
    const [result] = await pool.query(
        `UPDATE invoices i
         SET i.total = (
             SELECT COALESCE(SUM(o.total_amount), 0)
             FROM orders o
             WHERE o.invoice_id = i.invoice_id
         ),
         i.final_total = (
             SELECT COALESCE(SUM(o.total_amount), 0) - i.discount
             FROM orders o
             WHERE o.invoice_id = i.invoice_id
         )
         WHERE i.invoice_id = ?`,
        [invoice_id]
    );

    return result.affectedRows;
}

// hủy invoice (update status thành cancelled)
export async function cancelInvoiceModel(invoice_id) {
    const [rows] = await pool.query(
        `UPDATE invoices
         SET status = 'cancelled'
         WHERE invoice_id = ? AND status = 'pending'`,
        [invoice_id]
    );

    return rows.affectedRows;
}

// xóa invoice (hard delete - chỉ khi chưa có order)
export async function deleteInvoiceModel(invoice_id) {
    // check có orders không
    const [orderRows] = await pool.query(
        `SELECT COUNT(*) as count
         FROM orders
         WHERE invoice_id = ?`,
        [invoice_id]
    );

    const hasOrders = orderRows[0].count > 0;

    if (hasOrders) {
        // có orders → cancel thay vì delete
        const affected = await cancelInvoiceModel(invoice_id);
        return {
            status: 'cancelled',
            affectedRows: affected
        };
    }

    // không có orders → delete
    const [rows] = await pool.query(
        `DELETE FROM invoices
         WHERE invoice_id = ?`,
        [invoice_id]
    );

    return {
        status: 'hard_deleted',
        affectedRows: rows.affectedRows
    };
}
