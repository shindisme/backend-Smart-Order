import pool from '../config/db.js';
import { v7 as uuidv7 } from 'uuid';

export async function getAllStaffsModel() {
    const [rows] = await pool.query(
        `SELECT user_id, username, fullname, email, role, created_at
         FROM users
         WHERE is_deleted = 0
         ORDER BY created_at DESC`
    );
    return rows;
}

export async function getStaffByIdModel(user_id) {
    const [rows] = await pool.query(
        `SELECT user_id, username, fullname, email, role, created_at
         FROM users
         WHERE user_id = ? AND is_deleted = 0
         LIMIT 1`,
        [user_id]
    );
    return rows[0];
}

export async function insertStaffModel(data) {
    const { username, password, fullname, email, role } = data;
    const user_id = uuidv7();

    const [result] = await pool.query(
        `INSERT INTO users (user_id, username, password, fullname, email, role, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [user_id, username, password, fullname, email, role]
    );

    return user_id;
}

export async function updateStaffModel(user_id, data) {
    const { fullname, email, role } = data;
    const [result] = await pool.query(
        `UPDATE users
         SET fullname = ?, email = ?, role = ?
         WHERE user_id = ? AND is_deleted = 0`,
        [fullname, email, role, user_id]
    );
    return result.affectedRows;
}

export async function checkStaffHasRelations(user_id) {
    try {
        const tables = [
            'orders',
            'invoices',
            'activity_logs',
        ];

        for (const table of tables) {
            try {
                const [checkTable] = await pool.query(
                    `SHOW TABLES LIKE ?`,
                    [table]
                );

                if (checkTable.length > 0) {
                    const [rows] = await pool.query(
                        `SELECT COUNT(*) as count FROM ${table} WHERE user_id = ?`,
                        [user_id]
                    );

                    if (rows[0].count > 0) {
                        return true;
                    }
                }
            } catch (tableError) {
                console.log(tableError.message);
            }
        }

        return false;

    } catch (error) {
        console.error('Lỗi:', error);
        return true;
    }
}

export async function deleteStaffModel(user_id) {
    try {
        const hasRelations = await checkStaffHasRelations(user_id);

        if (hasRelations) {
            const [result] = await pool.query(
                `UPDATE users
                 SET is_deleted = 1
                 WHERE user_id = ?`,
                [user_id]
            );
            return {
                affectedRows: result.affectedRows,
                type: 'soft_delete',
                message: 'Nhân viên đã được ẩn '
            };
        } else {
            const [result] = await pool.query(
                `DELETE FROM users WHERE user_id = ?`,
                [user_id]
            );
            return {
                affectedRows: result.affectedRows,
                type: 'hard_delete',
                message: 'Nhân viên đã được xóa hoàn toàn'
            };
        }

    } catch (error) {
        console.error('Lỗi', error);
        throw error;
    }
}

export async function checkUsernameExistsModel(username, excludeUserId = null) {
    let query = 'SELECT user_id FROM users WHERE username = ? AND is_deleted = 0';
    const params = [username];

    if (excludeUserId) {
        query += ' AND user_id != ?';
        params.push(excludeUserId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
}

export async function updatePasswordModel(user_id, hashedPassword) {
    const [result] = await pool.query(
        `UPDATE users
         SET password = ?
         WHERE user_id = ? AND is_deleted = 0`,
        [hashedPassword, user_id]
    );
    return result.affectedRows;
}
