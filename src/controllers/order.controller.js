import {
    insertOrderModel,
    getOrdersByInvoiceIdModel,
    updateOrderStateModel,
    deleteOrderModel
} from '../models/order.model.js';
import { updateInvoiceTotalModel } from '../models/invoice.model.js';

// tạo order mới (gọi món)
export async function insertOrder(req, res) {
    try {
        const { invoice_id, table_id, service_id, items, note } = req.body;

        // validate
        if (!invoice_id) {
            return res.status(400).json({ message: 'Thiếu invoice_id' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Vui lòng chọn món' });
        }

        const newOrder = {
            invoice_id,
            table_id,
            service_id: service_id || null,
            items, // [{ item_id, quantity, total, note, options: [...] }]
            note: note || null
        };

        const order_id = await insertOrderModel(newOrder);

        // update tổng tiền invoice
        await updateInvoiceTotalModel(invoice_id);

        return res.status(201).json({
            message: 'Thêm đơn hàng thành công',
            order_id
        });
    } catch (error) {
        console.error("Lỗi thêm đơn hàng:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// lấy orders theo invoice_id
export async function getOrdersByInvoiceId(req, res) {
    try {
        const { invoice_id } = req.query; // ← dùng query param

        if (!invoice_id) {
            return res.status(400).json({ message: 'Thiếu invoice_id' });
        }

        const orders = await getOrdersByInvoiceIdModel(invoice_id);

        return res.status(200).json({
            message: 'Lấy danh sách đơn hàng thành công',
            data: orders
        });
    } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// update state của order
export async function updateOrderState(req, res) {
    try {
        const { id } = req.params;
        const { state } = req.body;

        // validate state
        const validStates = ['pending', 'processing', 'completed', 'cancelled'];
        if (!validStates.includes(state)) {
            return res.status(400).json({
                message: 'Trạng thái không hợp lệ'
            });
        }

        const affected = await updateOrderStateModel(id, state);

        if (affected === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        return res.status(200).json({
            message: 'Cập nhật trạng thái thành công'
        });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// xóa order
export async function deleteOrder(req, res) {
    try {
        const { id } = req.params;
        const affected = await deleteOrderModel(id);

        if (affected === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy đơn hàng hoặc không thể xóa'
            });
        }

        return res.status(200).json({
            message: 'Xóa đơn hàng thành công'
        });
    } catch (error) {
        console.error("Lỗi xóa đơn hàng:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}
