import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

// ! Lấy tất cả 
export async function getAllOptionsModel() {
    const [rows] = await pool.query(
        `SELECT o.*, g.name AS group_name
         FROM options o
         JOIN option_groups g ON o.group_id = g.group_id
         WHERE o.is_deleted = 0`
    );
    return rows;
}

// ! Lấy theo id
export async function getOptionByIdModel(id) {
    const [rows] = await pool.query(
        `SELECT o.*, g.name AS group_name
         FROM options o
         JOIN option_groups g ON o.group_id = g.group_id
         WHERE o.option_id = ? AND o.is_deleted = 0
        `,
        [id]
    );
    return rows[0] || null;
}

// Thêm 
export async function insertOptionModel(data) {
    const { name, group_id, description, plus_price } = data;
    const option_id = uuidv7();

    await pool.query(
        `INSERT INTO options (option_id, group_id, name, description, plus_price)
         VALUES (?, ?, ?, ?, ?)`,
        [option_id, group_id, name, description || '', plus_price || 0]
    );

    return option_id;
}

// Sửa
export async function updateOptionModel(id, data) {
    const { group_id, name, description, plus_price } = data;

    const [rows] = await pool.query(
        `UPDATE options
         SET group_id = ?,
             name = ?,
             description = ?,
             plus_price = ?
         WHERE option_id = ? AND is_deleted = 0`,
        [group_id, name, description || '', plus_price || 0, id]
    );

    return rows.affectedRows;
}


//!  Xóa
export async function deleteOptionModel(id) {
    // ? check ràng buộc
    const [orderDetailRows] = await pool.query(
        `SELECT COUNT(*) as count
         FROM options_order_details
         WHERE option_id = ?
        `,
        [id]
    );
    const isInOrderDetail = orderDetailRows[0].count > 0;

    if (isInOrderDetail) {
        // ? xóa mềm
        const [rows] = await pool.query(
            `UPDATE options
             SET is_deleted = 1
             WHERE option_id = ? AND is_deleted = 0`,
            [id]
        );

        return {
            status: 'soft_deleted',
            affectedRows: rows.affectedRows
        }
    }

    const [rows] = await pool.query(
        `DELETE FROM options
         WHERE option_id = ?
        `,
        [id]
    );

    return {
        status: 'hard_deleted',
        affectedRows: rows.affectedRows
    };
} 