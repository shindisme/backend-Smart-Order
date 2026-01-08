import {
    insertPaymentModel,
    getAllPaymentsModel,
    getPaymentByIdModel,
    createPendingPaymentModel,
    updatePaymentSuccessModel,
    updatePaymentFailedModel
} from '../models/payment.model.js';
import {
    createVnpayPaymentUrl,
    sortObject
} from '../services/vnpay.service.js';
import qs from 'qs';
import crypto from 'crypto';

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
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function getAllPayments(req, res) {
    try {
        const { invoice_id } = req.query; // query param: ?invoice_id=xxx

        const payments = await getAllPaymentsModel(invoice_id);

        return res.status(200).json({
            message: 'Lấy danh sách thanh toán thành công',
            data: payments
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

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
        return res.status(500).json({ message: 'Lỗi server' });
    }
}


export async function createVnpayPaymentUrlController(req, res) {
    try {
        const { invoice_id, amount } = req.body;

        if (!invoice_id) {
            return res.status(400).json({ message: 'Thiếu invoice_id' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Số tiền không hợp lệ' });
        }

        const payment_id = await createPendingPaymentModel(invoice_id, amount);

        const ipAddr =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip;

        // ✅ Lấy IP đầu tiên
        const cleanIp = ipAddr ? ipAddr.split(',')[0].trim() : '127.0.0.1';

        console.log('🌐 IP:', { original: ipAddr, clean: cleanIp });
        console.log('💰 Payment:', { invoice_id, amount, payment_id });

        const paymentUrl = createVnpayPaymentUrl({
            amount,
            orderId: payment_id,
            ipAddr: cleanIp
        });

        console.log('✅ URL created, length:', paymentUrl.length);

        return res.status(200).json({
            message: 'Tạo URL thanh toán VNPay thành công',
            payment_id,
            payment_url: paymentUrl
        });
    } catch (error) {
        console.error('❌ Error createVnpayPaymentUrlController:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}


export async function vnpayReturnController(req, res) {
    try {
        const vnp_HashSecret = process.env.VNP_HASH_SECRET;
        let vnp_Params = { ...req.query };

        console.log('🔙 VNPay Return Params:', vnp_Params);

        const secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });

        console.log('🔐 Return SignData:', signData);

        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        console.log('🔑 Hash Compare:', {
            vnpay: secureHash?.substring(0, 20),
            ours: signed.substring(0, 20),
            match: secureHash === signed
        });

        const payment_id = vnp_Params['vnp_TxnRef'];
        const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
        const vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];

        if (secureHash === signed && vnp_ResponseCode === '00') {
            console.log('✅ Payment SUCCESS:', payment_id);
            await updatePaymentSuccessModel(payment_id, vnp_TransactionNo);

            return res.redirect(
                `${process.env.FRONTEND_URL}/payment-success?payment_id=${payment_id}`
            );
        } else {
            console.log('❌ Payment FAILED:', { payment_id, code: vnp_ResponseCode });
            await updatePaymentFailedModel(payment_id);

            return res.redirect(
                `${process.env.FRONTEND_URL}/payment-fail?payment_id=${payment_id}`
            );
        }
    } catch (error) {
        console.error('❌ Error vnpayReturnController:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}
