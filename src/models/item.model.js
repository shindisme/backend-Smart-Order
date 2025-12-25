import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

// lấy tất cả
export async function getAllItemsModel() {
    const [rows] = await pool.query(
        `SELECT 
            i.*,
            c.name AS category_name,
            GROUP_CONCAT(DISTINCT iog.group_id) AS group_ids
         FROM items i
         JOIN categories c ON i.category_id = c.category_id
         LEFT JOIN items_option_groups iog ON i.item_id = iog.item_id
         WHERE i.is_deleted = 0
         GROUP BY i.item_id, c.name`
    );

    rows.forEach(row => {
        row.group_ids = row.group_ids
            ? row.group_ids.split(',')
            : [];
    });

    return rows;
}

export async function getItemByIdModel(item_id) {
    // lấy thông tin item
    const [itemRows] = await pool.query(
        `SELECT i.*, c.name AS category_name
     FROM items i
     JOIN categories c ON i.category_id = c.category_id
     WHERE i.item_id = ? AND i.is_deleted = 0`,
        [item_id]
    );

    if (itemRows.length === 0) return null;

    const item = itemRows[0];

    // lấy danh sách group_id của item
    const [groupRows] = await pool.query(
        `SELECT og.group_id, og.name, og.type
     FROM option_groups og
     JOIN items_option_groups iog ON iog.group_id = og.group_id
     WHERE iog.item_id = ? AND og.is_deleted = 0`,
        [item_id]
    );

    if (groupRows.length === 0) {
        return {
            ...item,
            groups: []
        };
    }

    // lấy tất cả options của các groups
    const groupIds = groupRows.map(g => g.group_id);
    const [optionRows] = await pool.query(
        `SELECT option_id, group_id, name, description, plus_price
     FROM options
     WHERE group_id IN (?) AND is_deleted = 0`,
        [groupIds]
    );

    // gộp options vào từng group
    const groups = groupRows.map(group => ({
        group_id: group.group_id,
        name: group.name,
        type: group.type,
        options: optionRows
            .filter(opt => opt.group_id === group.group_id)
            .map(opt => ({
                option_id: opt.option_id,
                name: opt.name,
                description: opt.description,
                plus_price: opt.plus_price
            }))
    }));

    return {
        ...item,
        groups
    };
}



// Thêm
export async function insertItemModel(data) {
    const { name, price, category_id, img, description, is_available } = data;
    const item_id = uuidv7();

    await pool.query(
        `INSERT INTO items (item_id, name, price, category_id, img, description, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item_id, name, price, category_id, img || '', description || '', is_available ?? 1]
    );

    return item_id;
}

// Sửa
export async function updateItemModel(id, data) {
    const { category_id, name, price, img, description, is_available } = data;

    let sql = `
        UPDATE items
        SET category_id = ?,
            name = ?,
            price = ?,
            description = ?,
            is_available = ?
    `;

    let params = [
        category_id,
        name,
        price,
        description || '',
        is_available
    ];

    // ? nếu có upload mới thì thêm ảnh vào
    if (img !== undefined && img !== "") {
        sql += `, img = ?`;
        params.push(img);
    }
    sql += ` WHERE item_id = ? AND is_deleted = 0`;
    params.push(id);

    const [rows] = await pool.query(sql, params);
    return rows.affectedRows;
}

//! Xóa cứng xóa mềm
export async function softDeleteItemModel(id) {
    const [rows] = await pool.query(
        `UPDATE items
         SET is_deleted = 1
         WHERE item_id = ? AND is_deleted = 0`,
        [id]
    );

    return rows.affectedRows;
}

export async function hardDeleteItemModel(id) {
    const [rows] = await pool.query(
        `DELETE FROM items
         WHERE item_id = ?`,
        [id]
    );

    return rows.affectedRows;
}

// hàm kiểm tra ràng buộc
async function checkItemConstraint(item_id) {

    //? check bên orderDetail
    const [orderdetailRow] = await pool.query(
        `SELECT COUNT(*) as count
         FROM order_details
         WHERE item_id = ?
        `,
        [item_id]
    );
    const isInOrderDetail = orderdetailRow[0].count > 0;

    //? check bên items_optionGroup
    const [optionGroupRow] = await pool.query(
        `SELECT COUNT(*) as count
         FROM items_option_groups
         WHERE item_id = ?
        `,
        [item_id]
    );
    const isInOptionGroup = optionGroupRow[0].count > 0;

    return {
        isInOrderDetail,
        isInOptionGroup
    };
}

// Xóa
export async function deleteItemModel(id) {

    // ? check ràng buộc
    const { isInOrderDetail, isInOptionGroup } = await checkItemConstraint(id);

    // ? nếu item có ràng buộc thì xóa mềm
    if (isInOrderDetail || isInOptionGroup) {
        const affected = await softDeleteItemModel(id);

        return {
            status: 'soft_deleted',
            affectedRows: affected
        };
    }

    // ? nếu ko thì xóa cứng
    await pool.query(
        `DELETE FROM items_option_groups
         WHERE item_id = ?`,
        [id]
    );

    const affected = await hardDeleteItemModel(id);

    return {
        status: 'hard_deleted',
        affectedRows: affected
    };
}

