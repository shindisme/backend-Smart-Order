import {
    getAllOrdersModel,
    getOrderDetailModel,
    createOrderModel,
    updateOrderStateModel,
    deleteOrderModel,
    getOrdersByTableIdModel
} from '../models/order.model.js';

export async function getAllOrders(req, res) {
    try {
        const orders = await getAllOrdersModel();
        res.status(200).json({
            message: 'Thành công',
            data: orders
        });
    } catch (error) {
        console.error('Error getAllOrders:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function getOrderDetail(req, res) {
    try {
        const { id } = req.params;
        const order = await getOrderDetailModel(id);

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy' });
        }

        res.status(200).json({
            message: 'Thành công',
            data: order
        });
    } catch (error) {
        console.error('Error getOrderDetail:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}
export async function createOrder(req, res) {
    try {
        const { invoice_id, table_id, user_id, items, note } = req.body;

        console.log('Received order request:', { invoice_id, table_id, items_count: items?.length });

        if (!table_id || !items || items.length === 0) {
            return res.status(400).json({ message: 'Thiếu table_id hoặc items' });
        }

        const order_id = await createOrderModel({
            invoice_id,
            table_id,
            user_id,
            items,
            note
        });

        res.status(201).json({
            message: 'Tạo đơn thành công',
            order_id: order_id
        });
    } catch (error) {
        console.error('Error createOrder:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            message: 'Lỗi tạo đơn',
            error: error.message
        });
    }
}


export async function updateOrderState(req, res) {
    try {
        const { id } = req.params;
        const { state } = req.body;

        const stateNum = Number(state);

        if (![0, 1, 2].includes(stateNum)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const affected = await updateOrderStateModel(id, stateNum);

        if (affected === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Error updateOrderState:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function deleteOrder(req, res) {
    try {
        const { id } = req.params;
        const affected = await deleteOrderModel(id);

        if (affected === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy hoặc đơn đã xác nhận'
            });
        }

        res.status(200).json({ message: 'Xóa thành công' });
    } catch (error) {
        console.error('Error deleteOrder:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

export async function getOrdersByTableId(req, res) {
    try {
        const { table_id } = req.query;

        if (!table_id) {
            return res.status(400).json({ message: 'Thiếu table_id' });
        }

        const orders = await getOrdersByTableIdModel(table_id);

        res.status(200).json({
            message: 'Thành công',
            data: orders
        });
    } catch (error) {
        console.error('Error getOrdersByTableId:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}
