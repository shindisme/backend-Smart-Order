import {
    getAllItemsModel,
    getItemByIdModel,
    insertItemModel,
    updateItemModel,
    softDeleteItemModel,
    hardDeleteItemModel
} from '../models/item.model.js';

export async function getAllItems(req, res) {
    try {
        const items = await getAllItemsModel();
        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export async function getItemById(req, res) {
    try {
        const { id } = req.params;
        const item = await getItemByIdModel(id);

        if (!item) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        res.status(200).json({
            message: 'Lấy thông tin sản phẩm',
            item
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function insertItem(req, res) {
    try {
        const insertId = await insertItemModel(req.body);

        res.status(201).json({
            message: 'Thêm sản phẩm loại thành công!',
            item_id: insertId,
            data: req.body
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Xóa mềm
export async function softDeleteItem(req, res) {
    try {
        const { id } = req.params;
        const affected = await softDeleteItemModel(id);

        if (affected === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        res.status(200).json({ message: 'Khóa sản phẩm loại thành công!' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Xóa cứng
export async function hardDeleteCategory(req, res) {
    try {
        const { id } = req.params;
        const affected = await hardDeleteItemModel(id);

        if (affected === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        return res.status(200).json({ message: 'Xóa sản phẩm thành công!' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function updateItem(req, res) {
    try {
        const { id } = req.params;
        const affected = await updateItemModel(id, req.body);

        if (affected === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        res.status(200).json({ message: 'Cập nhật sản phẩm thành công!' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
