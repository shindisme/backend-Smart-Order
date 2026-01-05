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

/**
 * ⭐ Kiểm tra nhân viên có ràng buộc với dữ liệu khác không
 * Thêm các bảng liên quan của bạn vào đây
 */
export async function checkStaffHasRelations(user_id) {
    try {
        // Ví dụ: Kiểm tra các bảng có thể liên quan đến user_id
        // Thay đổi theo cấu trúc database của bạn

        const tables = [
            'orders',      // Đơn hàng
            'invoices',    // Hóa đơn
            'activity_logs', // Lịch sử hoạt động
            // Thêm các bảng khác nếu có
        ];

        for (const table of tables) {
            try {
                // Kiểm tra xem bảng có tồn tại không
                const [checkTable] = await pool.query(
                    `SHOW TABLES LIKE ?`,
                    [table]
                );

                if (checkTable.length > 0) {
                    // Kiểm tra có record nào liên quan không
                    const [rows] = await pool.query(
                        `SELECT COUNT(*) as count FROM ${table} WHERE user_id = ?`,
                        [user_id]
                    );

                    if (rows[0].count > 0) {
                        console.log(`✋ Nhân viên có ${rows[0].count} bản ghi trong bảng ${table}`);
                        return true; // Có ràng buộc
                    }
                }
            } catch (tableError) {
                // Bảng không tồn tại hoặc không có cột user_id, bỏ qua
                console.log(`⚠️ Bỏ qua bảng ${table}:`, tableError.message);
            }
        }

        console.log('✅ Nhân viên không có ràng buộc, có thể xóa vĩnh viễn');
        return false; // Không có ràng buộc

    } catch (error) {
        console.error('❌ Lỗi kiểm tra ràng buộc:', error);
        // Nếu lỗi, an toàn hơn là xóa mềm
        return true;
    }
}

/**
 * ⭐ Xóa nhân viên thông minh
 * - Nếu không có ràng buộc: XÓA THẬT
 * - Nếu có ràng buộc: XÓA MỀM (is_deleted = 1)
 */
export async function deleteStaffModel(user_id) {
    try {
        // Kiểm tra ràng buộc
        const hasRelations = await checkStaffHasRelations(user_id);

        if (hasRelations) {
            // CÓ ràng buộc → XÓA MỀM
            console.log('🔄 Xóa mềm nhân viên (có ràng buộc)');
            const [result] = await pool.query(
                `UPDATE users
                 SET is_deleted = 1
                 WHERE user_id = ?`,
                [user_id]
            );
            return {
                affectedRows: result.affectedRows,
                type: 'soft_delete',
                message: 'Nhân viên đã được ẩn (vẫn giữ dữ liệu liên quan)'
            };
        } else {
            // KHÔNG có ràng buộc → XÓA THẬT
            console.log('🗑️ Xóa vĩnh viễn nhân viên (không có ràng buộc)');
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
        console.error('❌ Lỗi xóa nhân viên:', error);
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
