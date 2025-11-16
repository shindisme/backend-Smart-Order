export async function getAllStaff(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách nhân viên thành công!!!'
    });
};

export async function getStaffById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin nhân viên thành công!'
    });
}

export async function insertStaff(req, res) {
    res.status(200).json({
        message: 'Thêm nhân viên mới thành công!'
    });
}

export async function deleteStaff(req, res) {
    res.status(200).json({
        message: 'Xóa nhân viên thành công!'
    });
}

export async function updateStaff(req, res) {
    res.status(200).json({
        message: 'Cập nhật thông tin nhân viên thành công!'
    });
}
