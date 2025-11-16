export async function getAllPayments(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách thanh toán thành công!'
    });
}

export async function getPaymentById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin thanh toán thành công!'
    });
}

export async function insertPayment(req, res) {
    res.status(200).json({
        message: 'Thêm thông tin thanh toán thành công!'
    });
}

export async function updatePayment(req, res) {
    res.status(200).json({
        message: 'Cập nhật thông tin thanh toán thành công!'
    });
}

export async function deletePayment(req, res) {
    res.status(200).json({
        message: 'Xóa thông tin thanh toán thành công!'
    });
}
