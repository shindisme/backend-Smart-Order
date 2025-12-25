import {
    getAllOptionGroupsModel,
    getOptionGroupByIdModel,
    insertOptionGroupModel,
    updateOptionGroupModel,
    deleteOptionGroupModel
} from "../models/optionGroup.model.js";

// ! Lấy tất cả
export async function getAllOptionGroups(req, res) {
    try {
        const groups = await getAllOptionGroupsModel();
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Lấy theo ID
export async function getOptionGroupById(req, res) {
    try {
        const { id } = req.params;
        const group = await getOptionGroupByIdModel(id);

        if (!group) {
            return res.status(404).json({ message: "Nhóm tuỳ chọn không tồn tại" });
        }

        return res.status(200).json({
            message: "Lấy thông tin nhóm tuỳ chọn thành công",
            group
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Thêm mới
export async function insertOptionGroup(req, res) {
    try {
        const insertId = await insertOptionGroupModel(req.body);

        return res.status(201).json({
            message: "Thêm nhóm tuỳ chọn thành công!",
            group_id: insertId,
            data: req.body
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Cập nhật
export async function updateOptionGroup(req, res) {
    try {
        const { id } = req.params;
        const affected = await updateOptionGroupModel(id, req.body);

        if (affected === 0) {
            return res.status(404).json({ message: "Nhóm tuỳ chọn không tồn tại" });
        }

        return res.status(200).json({
            message: "Cập nhật nhóm tuỳ chọn thành công!"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// ! Xóa
export async function deleteOptionGroup(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteOptionGroupModel(id);

        if (result.status === "soft_deleted") {
            return res.status(200).json({
                message: "Nhóm tuỳ chọn đang được sử dụng, đã chuyển sang ẩn (xóa mềm)",
                mode: "soft",
                affectedRows: result.affectedRows
            });
        }

        if (result.status === "hard_deleted") {
            return res.status(200).json({
                message: "Xoá nhóm tuỳ chọn thành công!",
                mode: "hard",
                affectedRows: result.affectedRows
            });
        }

        return res.status(404).json({ message: "Nhóm tuỳ chọn không tồn tại" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
