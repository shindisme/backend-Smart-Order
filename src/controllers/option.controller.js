import {
    deleteOptionModel,
    getAllOptionsModel,
    getOptionByIdModel,
    insertOptionModel,
    updateOptionModel,
} from "../models/options.model.js";

// ! Lấy tất cả
export async function getAllOptions(req, res) {
    try {
        const options = await getAllOptionsModel();
        return res.status(200).json(options);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Lấy theo ID
export async function getOptionById(req, res) {
    try {
        const { id } = req.params;
        const option = await getOptionByIdModel(id);

        if (!option) {
            return res.status(404).json({ message: 'Tùy chọn không tồn tại' });
        }

        return res.status(200).json({
            message: 'Lấy thông tin tùy chọn thành công',
            option
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Thêm mới
export async function insertOption(req, res) {
    try {
        const insertId = await insertOptionModel(req.body);

        return res.status(201).json({
            message: 'Thêm tùy chọn mới thành công!',
            option_id: insertId,
            data: req.body
        });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ! Cập nhật
export async function updateOption(req, res) {
    try {
        const { id } = req.params;
        const affected = await updateOptionModel(id, req.body);

        if (affected === 0) {
            return res.status(404).json({ message: 'Tùy chọn này không tồn tại' });
        }

        res.status(200).json({ message: 'Cập nhật thông tin tùy chọn thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// ! xóa
export async function deleteOption(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteOptionModel(id);

        if (result.status === 'soft_deleted') {
            return res.status(200).json({
                message: 'Tùy chọn đang có liên kết, đã ẩn khỏi menu',
                mode: 'soft',
                affectedRows: result.affectedRows
            })
        }

        if (result.status === 'hard_deleted') {
            return res.status(200).json({
                message: 'Xóa thành công',
                mode: 'hard',
                affectedRows: result.affectedRows
            });
        }
        return res.status(404).json({ message: 'Tùy chọn không tồn tại' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
