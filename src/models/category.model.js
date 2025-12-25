import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

// Lấy tất cả 
export async function getAllCategoriesModel() {
    const [rows] = await pool.query(
        `SELECT *
         FROM categories
         WHERE is_deleted = 0`
    );
    return rows;
}

// Lấy theo id
export async function getCategoryByIdModel(id) {
    const [rows] = await pool.query(
        `SELECT *
         FROM categories
         WHERE category_id = ? AND is_deleted = 0`,
        [id]
    );
    return rows[0] || null;
}

// Thêm 
export async function insertCategoryModel(data) {
    const { name } = data;
    const category_id = uuidv7();

    await pool.query(
        `INSERT INTO categories (category_id, name)
         VALUES (?, ?)`,
        [category_id, name]
    );

    return category_id;
}

// Sửa
export async function updateCategoryModel(id, data) {
    const { name } = data;

    const [result] = await pool.query(
        `UPDATE categories
         SET name = ?
         WHERE category_id = ? AND is_deleted = 0`,
        [name, id]
    );

    return result.affectedRows;
}

//  Xoa
export async function deleteCategoryModel(id) {
    // ? check ràng buộc
    const [itemRows] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM items
         WHERE category_id = ? 
        `,
        [id]
    );
    const isInItem = itemRows[0].count > 0;

    if (isInItem) {
        // ? xóa mềm
        const [rows] = await pool.query(
            `UPDATE categories
             SET is_deleted = 1
             WHERE category_id = ? AND is_deleted = 0`,
            [id]
        );


        return {
            status: 'soft_deleted',
            affectedRows: rows.affectedRows
        }
    }

    const [rows] = await pool.query(
        `DELETE FROM categories
         WHERE category_id = ?
        `,
        [id]
    );

    return {
        status: 'hard_deleted',
        affectedRows: rows.affectedRows
    };
} 