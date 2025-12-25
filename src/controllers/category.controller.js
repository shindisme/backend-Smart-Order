import {
    getAllCategoriesModel,
    getCategoryByIdModel,
    insertCategoryModel,
    updateCategoryModel,
    deleteCategoryModel
} from '../models/category.model.js';

// ! Lấy tất cả
export async function getAllCategories(req, res) {
    try {
        const categories = await getAllCategoriesModel();
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Lấy theo ID
export async function getCategoryById(req, res) {
    try {
        const { id } = req.params;
        const category = await getCategoryByIdModel(id);

        if (!category) {
            return res.status(404).json({ message: 'Loại sản phẩm không tồn tại' });
        }

        return res.status(200).json({
            message: 'Lấy thông tin loại sản phẩm thành công',
            category
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Thêm mới
export async function insertCategory(req, res) {
    try {
        const insertId = await insertCategoryModel(req.body);

        return res.status(201).json({
            message: 'Thêm loại sản phẩm thành công!',
            category_id: insertId,
            data: req.body
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Cập nhật
export async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const affected = await updateCategoryModel(id, req.body);

        if (affected === 0) {
            return res.status(404).json({ message: 'Loại sản phẩm không tồn tại' });
        }

        return res.status(200).json({ message: 'Cập nhật loại sản phẩm thành công!' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! xóa
export async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteCategoryModel(id);

        if (result.status === 'soft_deleted') {
            return res.status(200).json({
                message: 'Sản phẩm đang có liên kết, đã ẩn khỏi menu',
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

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}