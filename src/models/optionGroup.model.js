import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

// ! Lấy tất cả 
export async function getAllOptionGroupsModel() {
    const [rows] = await pool.query(
        `SELECT *
         FROM option_groups
         WHERE is_deleted = 0`
    );
    return rows;
}

// ! Lấy theo id
export async function getOptionGroupByIdModel(id) {
    const [rows] = await pool.query(
        `SELECT *
         FROM option_groups
         WHERE group_id = ? AND is_deleted = 0`,
        [id]
    );
    return rows[0] || null;
}
// Lấy theo item id
export async function getOptionGroupsByItemId(item_id) {
    const [rows] = await pool.query(
        `
        SELECT og.group_id, og.name
        FROM option_groups og
        JOIN items_option_groups iog ON iog.group_id = og.group_id
        WHERE iog.item_id = ? AND og.is_deleted = 0
        `,
        [item_id]
    );

    return rows;
}
// ! Thêm 
export async function insertOptionGroupModel(data) {
    const { name } = data;
    const group_id = uuidv7();

    await pool.query(
        `INSERT INTO option_groups (group_id, name)
         VALUES (?, ?)`,
        [group_id, name]
    );

    return group_id;
}

//!  Sửa
export async function updateOptionGroupModel(id, data) {
    const { name } = data;

    const [rows] = await pool.query(
        `UPDATE option_groups
         SET name = ?
         WHERE group_id = ? AND is_deleted = 0`,
        [name, id]
    );

    return rows.affectedRows;
}

//!Xoa
//check contraint
async function checkOptionGroupConstraint(group_id) {
    const [optionRows] = await pool.query(
        `SELECT COUNT(*) as count
         FROM options
         WHERE group_id = ?
        `,
        [group_id]
    );
    const isInOption = optionRows[0].count > 0;

    const [itemRows] = await pool.query(
        `SELECT COUNT(*) as count
         FROM items_option_groups
         WHERE group_id = ?
        `,
        [group_id]
    );
    const isInItem = itemRows[0].count > 0;

    return {
        isInOption,
        isInItem
    };
}

// xóa
export async function deleteOptionGroupModel(id) {
    const { isInOption, isInItem } = await checkOptionGroupConstraint(id);

    if (isInOption || isInItem) {
        // ? xóa mềm
        const [rows] = await pool.query(
            `UPDATE option_groups
             SET is_deleted = 1
             WHERE group_id = ? AND is_deleted = 0`,
            [id]
        );

        return {
            status: 'soft_deleted',
            affectedRows: rows.affectedRows
        }
    }

    // ?xóa bên bảnh trung gian
    await pool.query(
        `DELETE FROM items_option_groups
         WHERE group_id = ?`,
        [id]
    );

    const [rows] = await pool.query(
        `DELETE FROM option_groups
         WHERE group_id = ?`,
        [id]
    );

    return {
        status: 'hard_deleted',
        affectedRows: rows.affectedRows
    };
} 