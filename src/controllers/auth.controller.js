import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
    getUserForLoginModel,
    getUserByIdModel,
    updatePasswordModel
} from '../models/auth.model.js';

export async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu'
            });
        }

        const user = await getUserForLoginModel(username);
        if (!user) {
            return res.status(401).json({
                message: 'Tài khoản không tồn tại'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Mật khẩu không chính xác'
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user_id: user.user_id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Lỗi server'
        });
    }
}

export async function getUser(req, res) {
    try {
        const user = await getUserByIdModel(req.user.user_id);

        if (!user) {
            return res.status(404).json({
                message: 'Người dùng không tồn tại'
            });
        }

        return res.status(200).json({
            message: 'Lấy thông tin người dùng thành công',
            data: user
        });

    } catch (error) {
        console.error('Get me error:', error);
        return res.status(500).json({
            message: 'Lỗi server'
        });
    }
}

export async function changePassword(req, res) {
    try {
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ mật khẩu'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                message: 'Mật khẩu mới phải ít nhất 6 ký tự'
            });
        }

        const user = await getUserForLoginModel(req.user.username);
        if (!user) {
            return res.status(404).json({
                message: 'Người dùng không tồn tại'
            });
        }

        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Mật khẩu cũ không chính xác'
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await updatePasswordModel(req.user.user_id, hashedPassword);

        return res.status(200).json({
            message: 'Đổi mật khẩu thành công'
        });

    } catch (error) {
        console.error('Đổi mật khẩu thất bại:', error);
        return res.status(500).json({
            message: 'Lỗi server'
        });
    }
}

export async function logout(req, res) {
    return res.status(200).json({
        message: 'Đăng xuất thành công'
    });
}
