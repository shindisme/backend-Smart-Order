import pool from '../config/db.js';

export async function getDashboardStatsModel() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    const [todayRevenue] = await pool.query(
        `SELECT COALESCE(SUM(final_total), 0) as total
         FROM invoices
         WHERE status = 1 AND created_at BETWEEN ? AND ?`,
        [startOfDay, endOfDay]
    );

    const [yesterdayRevenue] = await pool.query(
        `SELECT COALESCE(SUM(final_total), 0) as total
         FROM invoices
         WHERE status = 1 AND created_at BETWEEN ? AND ?`,
        [startOfYesterday, endOfYesterday]
    );

    const [todayOrders] = await pool.query(
        `SELECT COUNT(*) as count
         FROM orders
         WHERE created_at BETWEEN ? AND ?`,
        [startOfDay, endOfDay]
    );

    const [yesterdayOrders] = await pool.query(
        `SELECT COUNT(*) as count
         FROM orders
         WHERE created_at BETWEEN ? AND ?`,
        [startOfYesterday, endOfYesterday]
    );

    const [tables] = await pool.query(
        `SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN state = 1 THEN 1 ELSE 0 END) as in_use,
            SUM(CASE WHEN state = 0 THEN 1 ELSE 0 END) as available
         FROM tables
         WHERE is_deleted = 0`
    );

    const [orderStats] = await pool.query(
        `SELECT 
            SUM(CASE WHEN state = 0 THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN state = 1 THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN state = 2 THEN 1 ELSE 0 END) as completed
         FROM orders
         WHERE created_at BETWEEN ? AND ?`,
        [startOfDay, endOfDay]
    );

    const [recentOrders] = await pool.query(
        `SELECT 
            o.order_id,
            o.state,
            o.total_amount as total,
            o.created_at,
            t.name as table_name
         FROM orders o
         LEFT JOIN tables t ON o.table_id = t.table_id
         WHERE o.created_at BETWEEN ? AND ?
         ORDER BY o.created_at DESC
         LIMIT 10`,
        [startOfDay, endOfDay]
    );

    const [recentInvoices] = await pool.query(
        `SELECT 
            i.invoice_id,
            i.total,
            i.discount,
            i.final_total,
            i.status,
            i.created_at,
            t.name as table_name
         FROM invoices i
         LEFT JOIN tables t ON i.table_id = t.table_id
         ORDER BY i.created_at DESC
         LIMIT 10`
    );

    const [revenueChart] = await pool.query(
        `SELECT 
            DATE_FORMAT(created_at, '%d/%m') as date,
            COALESCE(SUM(final_total), 0) as revenue
         FROM invoices
         WHERE status = 1 
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         GROUP BY DATE(created_at)
         ORDER BY created_at ASC`
    );

    return {
        todayRevenue: parseFloat(todayRevenue[0].total) || 0,
        previousRevenue: parseFloat(yesterdayRevenue[0].total) || 0,
        todayOrders: parseInt(todayOrders[0].count) || 0,
        previousOrders: parseInt(yesterdayOrders[0].count) || 0,
        totalTables: parseInt(tables[0].total) || 0,
        tablesInUse: parseInt(tables[0].in_use) || 0,
        availableTables: parseInt(tables[0].available) || 0,
        pendingOrders: parseInt(orderStats[0].pending) || 0,
        processingOrders: parseInt(orderStats[0].processing) || 0,
        completedOrders: parseInt(orderStats[0].completed) || 0,
        recentOrders: recentOrders,
        recentInvoices: recentInvoices,
        revenueChart: revenueChart
    };
}
