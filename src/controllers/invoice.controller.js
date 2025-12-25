import {
    getAllInvoicesModel,
    getInvoiceByIdModel,
    insertInvoiceModel,
    updateInvoiceModel,
    deleteInvoiceModel
} from '../models/invoice.model.js';

// lấy tất cả invoices
export async function getAllInvoices(req, res) {
    try {
        const invoices = await getAllInvoicesModel();
        return res.status(200).json({
            message: 'Lấy danh sách hóa đơn thành công',
            data: invoices
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách hóa đơn:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// lấy 1 invoice có chi tiết orders
export async function getInvoiceById(req, res) {
    try {
        const { id } = req.params;
        const invoice = await getInvoiceByIdModel(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }

        return res.status(200).json({
            message: 'Lấy chi tiết hóa đơn thành công',
            data: invoice
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết hóa đơn:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// tạo invoice mới
export async function insertInvoice(req, res) {
    try {
        const { table_id, coupon_id, total, discount, final_total } = req.body;

        // validate
        if (!table_id) {
            return res.status(400).json({ message: 'Vui lòng chọn bàn' });
        }

        const newInvoice = {
            table_id,
            coupon_id: coupon_id || null,
            total: total || 0,
            discount: discount || 0,
            final_total: final_total || 0
        };

        const invoice_id = await insertInvoiceModel(newInvoice);

        return res.status(201).json({
            message: 'Tạo hóa đơn thành công',
            invoice_id,
            data: newInvoice
        });
    } catch (error) {
        console.error("Lỗi tạo hóa đơn:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// update invoice (coupon, discount...)
export async function updateInvoice(req, res) {
    try {
        const { id } = req.params;
        const { coupon_id, discount, total, final_total } = req.body;

        const updateData = { coupon_id, discount, total, final_total };

        const affected = await updateInvoiceModel(id, updateData);

        if (affected === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy hóa đơn hoặc đã thanh toán'
            });
        }

        return res.status(200).json({
            message: 'Cập nhật hóa đơn thành công'
        });
    } catch (error) {
        console.error("Lỗi cập nhật hóa đơn:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// xóa hoặc hủy invoice
export async function deleteInvoice(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteInvoiceModel(id);

        if (result.status === 'cancelled') {
            return res.status(200).json({
                message: 'Hóa đơn có đơn hàng, đã chuyển sang trạng thái hủy',
                mode: 'cancelled',
                affectedRows: result.affectedRows
            });
        }

        if (result.status === 'hard_deleted') {
            return res.status(200).json({
                message: 'Xóa hóa đơn thành công',
                mode: 'hard_deleted',
                affectedRows: result.affectedRows
            });
        }

        return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    } catch (error) {
        console.error("Lỗi xóa hóa đơn:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}
