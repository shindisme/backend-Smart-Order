import { v7 as uuidv7 } from 'uuid';
import pool from '../config/db.js';

export const TABLE_STATE = {
    AVAILABLE: 0,
    OCCUPIED: 1
};

export async function getAllTablesModel() {
    const [rows] = await pool.query(
        `SELECT * FROM tables 
         WHERE is_deleted = 0 
         ORDER BY name ASC`
    );
    return rows;
}

export async function getTableByIdModel(table_id) {
    const [rows] = await pool.query(
        `SELECT * FROM tables 
         WHERE table_id = ? AND is_deleted = 0`,
        [table_id]
    );
    return rows[0] || null;
}


export async function insertTableModel(data) {
    const { name, state = TABLE_STATE.AVAILABLE } = data;
    const table_id = uuidv7();

    await pool.query(
        `INSERT INTO tables (table_id, name, state, is_deleted)
         VALUES (?, ?, ?, ?)`,
        [table_id, name, state, 0]
    );

    return table_id;
}

export async function updateTableModel(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
    }

    if (data.state !== undefined) {
        fields.push('state = ?');
        values.push(data.state);
    }

    if (fields.length === 0) {
        return 0;
    }

    values.push(id);

    const [rows] = await pool.query(
        `UPDATE tables
         SET ${fields.join(', ')}
         WHERE table_id = ? AND is_deleted = 0`,
        values
    );

    return rows.affectedRows;
}

export async function softDeleteTableModel(id) {
    const [rows] = await pool.query(
        `UPDATE tables
         SET is_deleted = 1
         WHERE table_id = ? AND is_deleted = 0`,
        [id]
    );

    return rows.affectedRows;
}

export async function hardDeleteTableModel(id) {
    const [rows] = await pool.query(
        `DELETE FROM tables
         WHERE table_id = ?`,
        [id]
    );

    return rows.affectedRows;
}

async function checkTableConstraint(table_id) {
    const [invoiceRow] = await pool.query(
        `SELECT COUNT(*) as count
         FROM invoices
         WHERE table_id = ?`,
        [table_id]
    );

    const [orderRow] = await pool.query(
        `SELECT COUNT(*) as count
         FROM orders
         WHERE table_id = ?`,
        [table_id]
    );

    return {
        isInInvoice: invoiceRow[0].count > 0,
        isInOrder: orderRow[0].count > 0
    };
}

export async function deleteTableModel(id) {
    const { isInInvoice, isInOrder } = await checkTableConstraint(id);

    if (isInInvoice || isInOrder) {
        const affected = await softDeleteTableModel(id);
        return { status: 'soft_deleted', affectedRows: affected };
    }

    const affected = await hardDeleteTableModel(id);
    return { status: 'hard_deleted', affectedRows: affected };
}
