import pool from '../config/db.js';
import {
    getAllInvoicesModel,
    getInvoiceByIdModel,
    getPendingOrdersModel,
    insertInvoiceModel,
    payInvoiceModel,
    deleteInvoiceModel
} from '../models/invoice.model.js';

export async function getAllInvoices(req, res) {
    try {
        const data = await getAllInvoicesModel();
        return res.json({ message: 'OK', data });
    } catch (error) {
        console.error('❌ getAllInvoices:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function getInvoiceById(req, res) {
    try {
        const data = await getInvoiceByIdModel(req.params.id);
        if (!data) return res.status(404).json({ message: 'Không tìm thấy' });
        return res.json({ message: 'OK', data });
    } catch (error) {
        console.error('❌ getInvoiceById:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function getPendingOrders(req, res) {
    try {
        const data = await getPendingOrdersModel(req.params.table_id);
        return res.json({ message: 'OK', data });
    } catch (error) {
        console.error('❌ getPendingOrders:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// ✅ FIX: Lấy pending invoice với orders và items
export async function getPendingByTable(req, res) {
    try {
        const { table_id } = req.query;

        console.log('===== getPendingByTable =====');
        console.log('table_id:', table_id);
        console.log('req.query:', req.query);
        console.log('req.originalUrl:', req.originalUrl);

        if (!table_id) {
            console.log('❌ Thiếu table_id');
            return res.status(400).json({ message: 'Thiếu table_id' });
        }

        // 1. Lấy invoice pending
        console.log('🔍 Step 1: Query invoices...');
        const [invoices] = await pool.query(
            `SELECT i.*, t.name as table_name
             FROM invoices i
             LEFT JOIN tables t ON i.table_id = t.table_id
             WHERE i.table_id = ? AND i.status = 0
             ORDER BY i.created_at DESC
             LIMIT 1`,
            [table_id]
        );

        console.log('📊 Invoices found:', invoices.length);

        if (invoices.length === 0) {
            console.log('ℹ️ Không có invoice pending');
            return res.status(404).json({ message: 'Không có đơn hàng pending' });
        }

        const invoice = invoices[0];
        console.log('✅ Invoice:', invoice.invoice_id);

        // 2. Lấy tất cả orders của invoice
        console.log('🔍 Step 2: Query orders...');
        const [orders] = await pool.query(
            `SELECT o.order_id, o.invoice_id, o.table_id, o.user_id, o.note, o.state, o.created_at
             FROM orders o
             WHERE o.invoice_id = ?
             ORDER BY o.created_at ASC`,
            [invoice.invoice_id]
        );

        console.log('📊 Orders found:', orders.length);

        if (orders.length === 0) {
            console.log('⚠️ Invoice có nhưng không có orders!');
            invoice.orders = [];
            return res.status(200).json({
                message: 'Thành công',
                data: invoice
            });
        }

        // 3. Lấy items cho từng order
        for (const order of orders) {
            console.log(`🔍 Step 3: Query items for order ${order.order_id}...`);
            const [items] = await pool.query(
                `SELECT 
                    od.order_detail_id,
                    od.quantity,
                    od.total,
                    od.note,
                    i.item_id,
                    i.name as item_name,
                    i.img as item_img,
                    i.price
                 FROM order_details od
                 INNER JOIN items i ON od.item_id = i.item_id
                 WHERE od.order_id = ?`,
                [order.order_id]
            );

            console.log(`📊 Items found for order ${order.order_id}:`, items.length);

            // 4. Lấy options cho từng item
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

            order.total_amount = items.reduce((sum, item) => sum + Number(item.total), 0);
            order.items = items;
        }

        invoice.orders = orders;

        console.log('✅ Final response:');
        console.log('- Invoice ID:', invoice.invoice_id);
        console.log('- Orders count:', invoice.orders.length);
        console.log('- First order items:', invoice.orders[0]?.items?.length || 0);

        res.status(200).json({
            message: 'Thành công',
            data: invoice
        });
    } catch (error) {
        console.error('❌ Lỗi getPendingByTable:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
}


export async function insertInvoice(req, res) {
    try {
        const invoice_id = await insertInvoiceModel(req.body);
        return res.status(201).json({ message: 'Tạo thành công', invoice_id });
    } catch (error) {
        console.error('❌ insertInvoice:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function payInvoice(req, res) {
    try {
        const affected = await payInvoiceModel(req.params.id);
        if (affected === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        return res.json({ message: 'Thanh toán thành công' });
    } catch (error) {
        console.error('❌ payInvoice:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function deleteInvoice(req, res) {
    try {
        const affected = await deleteInvoiceModel(req.params.id);
        if (affected === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        return res.json({ message: 'Xóa thành công' });
    } catch (error) {
        console.error('❌ deleteInvoice:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}
