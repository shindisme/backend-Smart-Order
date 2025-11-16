import {
    getAllCategoriesModel,
    getCategoryByIdModel,
    insertCategoryModel,
    updateCategoryModel,
    softDeleteCategoryModel,
    hardDeleteCategoryModel
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
        console.log('BODY UPDATE:', req.body);
        const affected = await updateCategoryModel(id, req.body);

        if (affected === 0) {
            return res.status(404).json({ message: 'Loại sản phẩm không tồn tại' });
        }

        return res.status(200).json({ message: 'Cập nhật loại sản phẩm thành công!' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Xóa mềm
export async function softDeleteCategory(req, res) {
    try {
        const { id } = req.params;
        const affected = await softDeleteCategoryModel(id);

        if (affected === 0) {
            return res.status(404).json({ message: 'Loại sản phẩm không tồn tại' });
        }

        return res.status(200).json({ message: 'Khoá loại sản phẩm thành công!' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// ! Xóa cứng
export async function hardDeleteCategory(req, res) {
    try {
        const { id } = req.params;
        const affected = await hardDeleteCategoryModel(id);

        if (affected === 0) {
            return res.status(404).json({ message: 'Loại sản phẩm không tồn tại' });
        }
        return res.status(200).json({ message: 'Xóa loại sản phẩm thành công!' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
