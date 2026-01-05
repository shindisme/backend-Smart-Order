import {
    getAllTablesModel,
    getTableByIdModel,
    insertTableModel,
    updateTableModel,
    deleteTableModel,
    TABLE_STATE
} from '../models/table.model.js';

export async function getAllTables(req, res) {
    try {
        const tables = await getAllTablesModel();
        return res.status(200).json(tables);
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function getTableById(req, res) {
    try {
        const table = await getTableByIdModel(req.params.id);

        if (!table) {
            return res.status(404).json({ message: 'Không tìm thấy bàn' });
        }

        return res.status(200).json(table);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function insertTable(req, res) {
    try {
        const { name, state } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Tên bàn không hợp lệ' });
        }

        if (state !== undefined && ![TABLE_STATE.AVAILABLE, TABLE_STATE.OCCUPIED].includes(Number(state))) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const tableId = await insertTableModel({
            name: name.trim(),
            state: state !== undefined ? Number(state) : TABLE_STATE.AVAILABLE
        });

        return res.status(201).json({ table_id: tableId });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function updateTable(req, res) {
    try {
        const { name, state } = req.body;
        const updateData = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: 'Tên bàn không hợp lệ' });
            }
            updateData.name = name.trim();
        }

        if (state !== undefined) {
            if (![TABLE_STATE.AVAILABLE, TABLE_STATE.OCCUPIED].includes(Number(state))) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }
            updateData.state = Number(state);
        }

        const affected = await updateTableModel(req.params.id, updateData);

        if (affected === 0) {
            return res.status(404).json({ message: 'Bàn không tồn tại' });
        }

        return res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function deleteTable(req, res) {
    try {
        const result = await deleteTableModel(req.params.id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bàn không tồn tại' });
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
