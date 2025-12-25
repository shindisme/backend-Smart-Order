import {
    insertPaymentModel,
    getAllPaymentsModel,
    getPaymentByIdModel
} from '../models/payment.model.js';

// tạo payment mới 
export async function createPayment(req, res) {
    try {
        const { invoice_id, amount, payment_method, payment_channel, payment_reference } = req.body;

        // validate
        if (!invoice_id) {
            return res.status(400).json({ message: 'Thiếu invoice_id' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Số tiền không hợp lệ' });
        }

        if (!payment_method) {
            return res.status(400).json({ message: 'Vui lòng chọn phương thức thanh toán' });
        }

        const paymentData = {
            invoice_id,
            amount,
            payment_method,
            payment_channel: payment_channel || null,
            payment_reference: payment_reference || null
        };

        const payment_id = await insertPaymentModel(paymentData);

        return res.status(201).json({
            message: 'Thanh toán thành công',
            payment_id
        });
    } catch (error) {
        console.error("Lỗi thanh toán:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// lấy tất cả payments (có filter theo invoice_id)
export async function getAllPayments(req, res) {
    try {
        const { invoice_id } = req.query; // query param: ?invoice_id=xxx

        const payments = await getAllPaymentsModel(invoice_id);

        return res.status(200).json({
            message: 'Lấy danh sách thanh toán thành công',
            data: payments
        });
    } catch (error) {
        console.error("Lỗi lấy payments:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

// lấy 1 payment theo id
export async function getPaymentById(req, res) {
    try {
        const { id } = req.params;

        const payment = await getPaymentByIdModel(id);

        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy payment' });
        }

        return res.status(200).json({
            message: 'Lấy chi tiết thanh toán thành công',
            data: payment
        });
    } catch (error) {
        console.error("Lỗi lấy payment:", error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}
