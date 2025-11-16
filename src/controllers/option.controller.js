export async function getAllOptions(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách tùy chọn thành công!'
    });
}

export async function getOptionById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin tùy chọn thành công!'
    });
}

export async function insertOption(req, res) {
    res.status(200).json({
        message: 'Thêm tùy chọn mới thành công!'
    });
}

export async function updateOption(req, res) {
    res.status(200).json({
        message: 'Cập nhật tùy chọn thành công!'
    });
}

export async function deleteOption(req, res) {
    res.status(200).json({
        message: 'Xóa tùy chọn thành công!'
    });
}
