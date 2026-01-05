import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Chưa đăng nhập'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }
}

export function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Không có quyền truy cập'
        });
    }
    next();
}
