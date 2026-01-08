import qs from 'qs';
import crypto from 'crypto';

export function sortObject(obj) {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = obj[key];
        });
    return sorted;
}

function formatVnpDate(date) {
    const pad = (n) => n.toString().padStart(2, '0');

    return (
        date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

export function createVnpayPaymentUrl({ amount, orderId, ipAddr }) {
    const vnp_TmnCode = process.env.VNP_TMN_CODE;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_Url = process.env.VNP_URL;
    const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

    const now = new Date();
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    const createDate = formatVnpDate(vnTime);

    const expireTime = new Date(vnTime.getTime() + 15 * 60 * 1000);
    const expireDate = formatVnpDate(expireTime);

    console.log('🕐 VN Time:', { createDate, expireDate, orderId });

    const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan hoa don ${orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: (amount * 100).toString(),
        vnp_ReturnUrl,
        vnp_IpAddr: ipAddr || '127.0.0.1',
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
    };

    const sorted = sortObject(vnp_Params);
    const signData = qs.stringify(sorted, { encode: false });

    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(signData, 'utf-8').digest('hex');

    const fullParams = {
        ...sorted,
        vnp_SecureHash: signed
    };

    return `${vnp_Url}?${qs.stringify(fullParams, { encode: false })}`;
}
