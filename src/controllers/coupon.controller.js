import {
    getAllCouponsModel,
    getCouponByIdModel,
    checkCouponCodeExistsModel,
    insertCouponModel,
    updateCouponModel,
    deleteCouponModel,
    validateCouponModel
} from '../models/coupon.model.js';

export async function getAllCoupons(req, res) {
    try {
        const coupons = await getAllCouponsModel();
        return res.status(200).json({
            message: 'Lấy danh sách coupon thành công',
            data: coupons
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function getCouponById(req, res) {
    try {
        const { id } = req.params;
        const coupon = await getCouponByIdModel(id);

        if (!coupon) {
            return res.status(404).json({ message: 'Không tìm thấy coupon' });
        }

        return res.status(200).json({
            message: 'Lấy chi tiết coupon thành công',
            data: coupon
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function insertCoupon(req, res) {
    try {
        const { code, type, value, start_date, end_date } = req.body;

        if (!code || type === undefined || !value || !start_date || !end_date) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const exists = await checkCouponCodeExistsModel(code);
        if (exists) {
            return res.status(400).json({ message: 'Mã coupon đã tồn tại' });
        }

        if (![0, 1].includes(type)) {
            return res.status(400).json({ message: 'Loại coupon không hợp lệ' });
        }

        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc' });
        }

        const coupon_id = await insertCouponModel(req.body);

        return res.status(201).json({
            message: 'Thêm coupon thành công',
            coupon_id
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function updateCoupon(req, res) {
    try {
        const { id } = req.params;
        const { code } = req.body;

        if (code) {
            const exists = await checkCouponCodeExistsModel(code, id);
            if (exists) {
                return res.status(400).json({ message: 'Mã coupon đã tồn tại' });
            }
        }

        const affected = await updateCouponModel(id, req.body);

        if (affected === 0) {
            return res.status(404).json({ message: 'Không tìm thấy coupon' });
        }

        return res.status(200).json({
            message: 'Cập nhật coupon thành công'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function deleteCoupon(req, res) {
    try {
        const { id } = req.params;
        const affected = await deleteCouponModel(id);

        if (affected === 0) {
            return res.status(404).json({ message: 'Không tìm thấy coupon' });
        }

        return res.status(200).json({
            message: 'Xóa coupon thành công'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function validateCoupon(req, res) {
    try {
        const { code, total_amount } = req.body;

        if (!code || !total_amount) {
            return res.status(400).json({ message: 'Thiếu thông tin' });
        }

        const result = await validateCouponModel(code, total_amount);

        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }

        return res.status(200).json({
            success: true,
            message: 'Mã giảm giá hợp lệ',
            data: {
                coupon: result.coupon,
                discount: result.discount
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

