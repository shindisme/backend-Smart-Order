import {
    getAllInvoicesModel,
    getInvoiceByIdModel,
    payInvoiceModel
} from '../models/invoice.model.js';

export async function getAllInvoices(req, res) {
    try {
        const invoices = await getAllInvoicesModel();
        res.status(200).json({
            message: 'Lấy danh sách hóa đơn thành công',
            data: invoices
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
}

export async function getInvoiceById(req, res) {
    try {
        const { id } = req.params;

        const invoice = await getInvoiceByIdModel(id);

        if (!invoice) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }

        res.status(200).json({
            message: 'Lấy chi tiết hóa đơn thành công',
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
}

export async function payInvoice(req, res) {
    try {
        const { id } = req.params;
        const { coupon_code } = req.body;

        await payInvoiceModel(id, coupon_code);

        res.status(200).json({
            message: 'Thanh toán thành công'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Lỗi thanh toán'
        });
    }
}
