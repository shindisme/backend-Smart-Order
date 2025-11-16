export async function getAllTables(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách bàn thành công!!!'
    });
};

export async function getTableById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin bàn thành công!'
    });
}

export async function insertTable(req, res) {
    res.status(200).json({
        message: 'Thêm bàn mới thành công!'
    });
}

export async function deleteTable(req, res) {
    res.status(200).json({
        message: 'Xóa bàn thành công!'
    });
}

export async function updateTable(req, res) {
    res.status(200).json({
        message: 'Cập nhật bàn thành công!'
    });
}
