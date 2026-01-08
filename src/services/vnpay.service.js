import qs from 'qs';
import crypto from 'crypto';
import moment from 'moment-timezone';

export function sortObject(obj) {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = obj[key];
        });
    return sorted;
}

export function createVnpayPaymentUrl({ amount, orderId, ipAddr }) {
    const vnp_TmnCode = process.env.VNP_TMN_CODE;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_Url = process.env.VNP_URL;
    const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

    // ✅ FIX: Dùng moment-timezone chắc chắn GMT+7
    const createDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
    const expireDate = moment().tz('Asia/Ho_Chi_Minh').add(15, 'minutes').format('YYYYMMDDHHmmss');

    // LOG DEBUG (bắt buộc!)
    console.log('🔑 VNPay Config:', {
        TmnCode: vnp_TmnCode,
        SecretExists: !!vnp_HashSecret,
        SecretLength: vnp_HashSecret?.length,
        ReturnUrl: vnp_ReturnUrl
    });
    console.log('🕐 Dates:', { createDate, expireDate, orderId });

    const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,  // Không dấu!
        vnp_OrderType: 'other',
        vnp_Amount: (amount * 100).toString(),
        vnp_ReturnUrl,
        vnp_IpAddr: ipAddr || '127.0.0.1',
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
    };

    console.log('📋 Params (unsorted):', vnp_Params);

    const sorted = sortObject(vnp_Params);
    const signData = qs.stringify(sorted, { encode: false });

    console.log('🔐 SignData:', signData);  // ← QUAN TRỌNG!

    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    console.log('✍️ SecureHash:', signed);

    const fullParams = { ...sorted, vnp_SecureHash: signed };

    // ✅ FIX: Encode URL (default true)
    const finalUrl = `${vnp_Url}?${qs.stringify(fullParams)}`;

    console.log('🌐 URL Length:', finalUrl.length);

    return finalUrl;
}
