export async function getAllOptionGroups(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách nhóm tùy chọn thành công!'
    });
}

export async function getOptionGroupById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin nhóm tùy chọn thành công!'
    });
}

export async function insertOptionGroup(req, res) {
    res.status(200).json({
        message: 'Thêm nhóm tùy chọn thành công!'
    });
}

export async function updateOptionGroup(req, res) {
    res.status(200).json({
        message: 'Cập nhật nhóm tùy chọn thành công!'
    });
}

export async function deleteOptionGroup(req, res) {
    res.status(200).json({
        message: 'Xóa nhóm tùy chọn thành công!'
    });
}
