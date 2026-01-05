import pool from '../config/db.js';

export async function getDashboardStatsModel() {
    // Doanh thu hôm nay
    const [revenue] = await pool.query(
        `SELECT COALESCE(SUM(final_total), 0) as total
         FROM invoices
         WHERE DATE(created_at) = CURDATE() AND status = 1`
    );

    // Hóa đơn hôm nay
    const [invoices] = await pool.query(
        `SELECT COUNT(*) as count
         FROM invoices
         WHERE DATE(created_at) = CURDATE()`
    );

    // Đơn hàng hôm nay
    const [orders] = await pool.query(
        `SELECT COUNT(*) as count
         FROM orders
         WHERE DATE(created_at) = CURDATE()`
    );

    // Bàn trống
    const [tables] = await pool.query(
        `SELECT COUNT(*) as count
         FROM tables
         WHERE state = 0 AND is_deleted = 0`
    );

    // Hóa đơn gần đây (10 hóa đơn)
    const [recentInvoices] = await pool.query(
        `SELECT i.*, t.name as table_name
         FROM invoices i
         LEFT JOIN tables t ON i.table_id = t.table_id
         ORDER BY i.created_at DESC
         LIMIT 10`
    );

    return {
        todayRevenue: revenue[0].total,
        todayInvoices: invoices[0].count,
        todayOrders: orders[0].count,
        availableTables: tables[0].count,
        recentInvoices
    };
}
