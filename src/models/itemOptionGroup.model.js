import pool from "../config/db.js";

export async function getGroupsByItemIdModel(itemId) {
    const [rows] = await pool.query(
        `SELECT group_id 
         FROM items_option_groups 
         WHERE item_id = ?`,
        [itemId]
    );
    return rows.map(r => r.group_id);
}

// !  XÓa nhóm của item
export async function deleteGroupsByItemIdModel(itemId) {
    await pool.query(
        `DELETE FROM items_option_groups WHERE item_id = ?`,
        [itemId]
    );
}

// ! Thêm nhiều nhóm vào item
export async function insertItemGroupsModel(itemId, groupIds = []) {
    if (!groupIds.length) return;

    const values = groupIds.map(groupId => [itemId, groupId]);

    await pool.query(
        `INSERT INTO items_option_groups (item_id, group_id)
         VALUES ?`,
        [values]
    );
}