import { getDashboardStatsModel } from '../models/dashboard.model.js';

export async function getDashboardStats(req, res) {
    try {
        const data = await getDashboardStatsModel();
        return res.json({ message: 'OK', data });
    } catch (error) {
        console.error('❌ getDashboardStats:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}
