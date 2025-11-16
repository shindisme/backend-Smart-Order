import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

export async function getAllCategoriesModel() {
    const [rows] = await pool.query(
        'SELECT * FROM categories WHERE is_deleted = 0'
    );
    return rows;
}

export async function getCategoryByIdModel(id) {
    const [rows] = await pool.query(
        `SELECT * FROM categories
         WHERE category_id = ? AND is_deleted = 0`,
        [id]
    );
    return rows[0] || null;
}

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

export async function updateCategoryModel(id, data) {
    const { name } = data;

    const [result] = await pool.query(
        `UPDATE categories
         SET name = ?
         WHERE category_id = ?`,
        [name, id]
    );

    return result.affectedRows;
}

export async function softDeleteCategoryModel(id) {
    const [result] = await pool.query(
        `UPDATE categories
         SET is_deleted = 1
         WHERE category_id = ?`,
        [id]
    );

    return result.affectedRows;
}

export async function hardDeleteCategoryModel(id) {
    const [result] = await pool.query(
        `DELETE FROM categories
         WHERE category_id = ?`,
        [id]
    );

    return result.affectedRows;
}