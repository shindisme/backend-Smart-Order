import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

export async function getAllItemsModel() {
    const [rows] = await pool.query(
        'SELECT * FROM items WHERE is_deleted = 0'
    );
    return rows;
}

export async function getItemByIdModel(id) {
    const [rows] = await pool.query(
        `SELECT * FROM items 
        WHERE item_id = ? AND is_deleted = 0`,
        [id]
    );
    return rows[0] || null;
}

export async function insertItemModel(data) {
    const { name, price, category_id, img, description } = data;
    const item_id = uuidv7();

    await pool.query(
        `INSERT INTO items (item_id, name, price, category_id, img, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [item_id, name, price, category_id, img, description]
    );

    return item_id;
}

export async function updateItemModel(id, data) {
    const { category_id, name, price, img, description, is_available } = data;

    const [result] = await pool.query(
        `UPDATE items
         SET category_id = ?, name = ?, price = ?, img = ?, description = ?, is_available = ?
         WHERE item_id = ?`,
        [category_id, name, price, img, description, is_available, id]
    );

    return result.affectedRows;
}

export async function softDeleteItemModel(id) {
    const [result] = await pool.query(
        `UPDATE items
         SET is_deleted = 1
         WHERE item_id = ?`,
        [id]
    );

    return result.affectedRows;
}

export async function hardDeleteItemModel(id) {
    const [result] = await pool.query(
        `DELETE FROM items
         WHERE item_id = ?`,
        [id]
    );

    return result.affectedRows;
}