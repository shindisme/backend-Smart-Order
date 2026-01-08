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

    const createDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
    const expireDate = moment().tz('Asia/Ho_Chi_Minh').add(15, 'minutes').format('YYYYMMDDHHmmss');

    const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: 'Thanh toan don hang',
        vnp_OrderType: 'other',
        vnp_Amount: (amount * 100).toString(),
        vnp_ReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
    };

    const sorted = sortObject(vnp_Params);
    const signData = qs.stringify(sorted, { encode: false });

    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const fullParams = { ...sorted, vnp_SecureHash: signed };

    return `${vnp_Url}?${qs.stringify(fullParams)}`;
}
