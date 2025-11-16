export async function getAllInvoices(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách hóa đơn thành công!'
    });
}

export async function getInvoiceById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin hóa đơn thành công!'
    });
}

export async function insertInvoice(req, res) {
    res.status(200).json({
        message: 'Tạo hóa đơn thành công!'
    });
}

export async function updateInvoice(req, res) {
    res.status(200).json({
        message: 'Cập nhật hóa đơn thành công!'
    });
}

export async function deleteInvoice(req, res) {
    res.status(200).json({
        message: 'Xóa hóa đơn thành công!'
    });
}
