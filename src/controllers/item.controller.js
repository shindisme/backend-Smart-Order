import {
    getAllItemsModel,
    insertItemModel,
    updateItemModel,
    deleteItemModel,
    getItemByIdModel,
} from '../models/item.model.js';
import {
    deleteGroupsByItemIdModel,
    insertItemGroupsModel
} from '../models/itemOptionGroup.model.js'

export async function getAllItems(req, res) {
    try {
        const items = await getAllItemsModel();
        return res.status(200).json({
            message: 'Lấy danh sách sản phẩm thành công',
            data: items
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server'
        });
    }
};

export async function insertItem(req, res) {
    try {
        const { name, price, category_id, description, is_available } = req.body;

        // validate
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Tên sản phẩm không được để trống' });
        }

        const priceNum = Number(price);
        if (!price || isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({ message: 'Giá không hợp lệ' });
        } else if (priceNum > 100000000) {
            return res.status(400).json({ message: 'Giá không được lớn hơn 100.000.000đ' });
        }

        if (!category_id) {
            return res.status(400).json({ message: 'Vui lòng chọn loại sản phẩm' });
        }

        const img = req.file ? `${req.file.filename}` : null;

        // groups từ FE
        let group_ids = req.body.group_ids;
        if (!Array.isArray(group_ids)) group_ids = group_ids ? [group_ids] : [];

        const newItem = {
            name: name.trim(),
            price: priceNum,
            category_id,
            description,
            img,
            is_available
        };

        const itemId = await insertItemModel(newItem);

        await insertItemGroupsModel(itemId, group_ids);

        return res.status(201).json({
            message: 'Thêm sản phẩm thành công!',
            item_id: itemId,
            data: newItem
        });

    } catch (error) {
        return res.status(500).json({ message: 'Có lỗi xảy ra khi thêm sản phẩm' });
    }
}


// Sửa
export async function updateItem(req, res) {
    try {
        const { id } = req.params;

        const { name, price, category_id, description, is_available } = req.body;

        //validate
        const priceNum = Number(price);
        if (price && (isNaN(priceNum) || priceNum <= 0)) {
            return res.status(400).json({ message: 'Giá không hợp lệ' });
        }
        else if (priceNum > 100000000) {
            return res.status(400).json({ message: 'Giá không được lớn hơn 100.000.000đ' });
        }

        let group_ids = req.body.group_ids;
        if (!Array.isArray(group_ids)) group_ids = group_ids ? [group_ids] : [];

        // xử lý ảnh
        const img = req.file ? req.file.filename : undefined;

        const updateData = { name, price, category_id, description, is_available, img };

        const affected = await updateItemModel(id, updateData);
        if (affected === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        await deleteGroupsByItemIdModel(id);
        await insertItemGroupsModel(id, group_ids);

        return res.status(200).json({ message: "Cập nhật sản phẩm thành công!" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// Xóa
export async function deleteItem(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteItemModel(id);

        if (result.status === 'soft_deleted') {
            return res.status(200).json({
                message: 'Sản phẩm đang có liên kết, đã ẩn khỏi menu',
                mode: 'soft',
                affectedRows: result.affectedRows
            });
        }

        //? xóa luôn
        if (result.status === 'hard_deleted') {
            return res.status(200).json({
                message: 'Xóa thành công',
                mode: 'hard',
                affectedRows: result.affectedRows
            });
        }

        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function getItemById(req, res) {
    try {
        const { id } = req.params;
        const data = await getItemByIdModel(id);

        if (!data) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        return res.status(200).json({
            message: "Lấy chi tiết sản phẩm thành công",
            data
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}