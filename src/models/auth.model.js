import pool from '../config/db.js';

export async function getUserForLoginModel(username) {
    const [rows] = await pool.query(
        `SELECT user_id, username, password, role, fullname, email
         FROM users
         WHERE username = ?
           AND is_deleted = 0
         LIMIT 1`,
        [username]
    );
    return rows[0];
}

export async function getUserByIdModel(user_id) {
    const [rows] = await pool.query(
        `SELECT user_id, username, role, fullname, email
         FROM users
         WHERE user_id = ?
           AND is_deleted = 0
         LIMIT 1`,
        [user_id]
    );
    return rows[0];
}

export async function updatePasswordModel(user_id, hashedPassword) {
    const [rows] = await pool.query(
        `UPDATE users
         SET password = ?
         WHERE user_id = ? AND is_deleted = 0`,
        [hashedPassword, user_id]
    );
    return rows.affectedRows;
}
