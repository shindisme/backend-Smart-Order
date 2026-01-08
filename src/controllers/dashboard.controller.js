import { getDashboardStatsModel } from '../models/dashboard.model.js';

export async function getStats(req, res) {
    try {
        const stats = await getDashboardStatsModel();

        res.status(200).json({
            message: 'Lấy thống kê thành công',
            data: stats
        });
    } catch (error) {

        res.status(500).json({
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
