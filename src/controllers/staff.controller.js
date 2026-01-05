import bcrypt from 'bcrypt';
import {
    getAllStaffsModel,
    getStaffByIdModel,
    insertStaffModel,
    updateStaffModel,
    deleteStaffModel,
    checkUsernameExistsModel,
    updatePasswordModel
} from '../models/staff.model.js';
import { sendPasswordResetEmail, sendNewAccountEmail } from '../services/email.service.js';

/**
 * Hàm tạo mật khẩu ngẫu nhiên an toàn hơn
 */
function generateRandomPassword(length = 12) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + special;
    let password = '';

    // Đảm bảo có ít nhất 1 ký tự mỗi loại
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Thêm các ký tự còn lại
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Xáo trộn password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function getAllStaffs(req, res) {
    try {
        const staffs = await getAllStaffsModel();

        return res.status(200).json({
            message: 'Lấy danh sách nhân viên thành công',
            data: staffs
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server'
        });
    }
}

export async function getStaffById(req, res) {
    try {
        const { id } = req.params;

        const staff = await getStaffByIdModel(id);

        if (!staff) {
            return res.status(404).json({
                message: 'Nhân viên không tồn tại'
            });
        }

        return res.status(200).json({
            message: 'Lấy thông tin nhân viên thành công',
            data: staff
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server'
        });
    }
}

export async function insertStaff(req, res) {
    try {
        const { username, fullname, email, role } = req.body;

        // Validation đầy đủ
        if (!username || !fullname || !role) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        // Email bắt buộc
        if (!email || email.trim() === '') {
            return res.status(400).json({
                message: 'Email không được để trống'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: 'Email không hợp lệ'
            });
        }

        const usernameExists = await checkUsernameExistsModel(username);
        if (usernameExists) {
            return res.status(400).json({
                message: 'Tài khoản đã tồn tại'
            });
        }

        const randomPassword = generateRandomPassword(12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const user_id = await insertStaffModel({
            username,
            password: hashedPassword,
            fullname,
            email: email.toLowerCase().trim(),
            role
        });

        try {
            await sendNewAccountEmail(
                email.toLowerCase().trim(),
                fullname,
                username,
                randomPassword
            );
        } catch (error) {

        }

        return res.status(201).json({
            message: 'Tạo nhân viên thành công',
            data: {
                user_id,
                username,
                password: randomPassword,
                fullname,
                email,
                role
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server: ' + error.message
        });
    }
}

export async function updateStaff(req, res) {
    try {
        const { id } = req.params;
        const { fullname, email, role } = req.body;

        if (!fullname || !role) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        if (!email || email.trim() === '') {
            return res.status(400).json({
                message: 'Email không được để trống'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: 'Email không hợp lệ'
            });
        }

        const staff = await getStaffByIdModel(id);
        if (!staff) {
            return res.status(404).json({
                message: 'Nhân viên không tồn tại'
            });
        }

        await updateStaffModel(id, {
            fullname,
            email: email.toLowerCase().trim(),
            role
        });

        return res.status(200).json({
            message: 'Cập nhật nhân viên thành công'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server'
        });
    }
}

export async function deleteStaff(req, res) {
    try {
        const { id } = req.params;

        const staff = await getStaffByIdModel(id);
        if (!staff) {
            return res.status(404).json({
                message: 'Nhân viên không tồn tại'
            });
        }

        if (req.user.user_id === id) {
            return res.status(400).json({
                message: 'Không thể xóa chính mình'
            });
        }

        const result = await deleteStaffModel(id);

        return res.status(200).json({
            message: result.message,
            deleteType: result.type,
            data: {
                username: staff.username,
                fullname: staff.fullname
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server: ' + error.message
        });
    }
}

export async function resetStaffPassword(req, res) {
    try {
        const { id } = req.params;

        const staff = await getStaffByIdModel(id);
        if (!staff) {
            return res.status(404).json({
                message: 'Nhân viên không tồn tại'
            });
        }

        // Kiểm tra email
        if (!staff.email || staff.email.trim() === '') {
            return res.status(400).json({
                message: 'Nhân viên chưa có email. Vui lòng cập nhật email trước khi cấp lại mật khẩu.'
            });
        }

        // Tạo mật khẩu mới
        const randomPassword = generateRandomPassword(12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Cập nhật password
        await updatePasswordModel(id, hashedPassword);

        // Gửi mail
        try {
            await sendPasswordResetEmail(
                staff.email,
                staff.fullname,
                staff.username,
                randomPassword
            );

            return res.status(200).json({
                success: true,
                message: 'Cấp lại mật khẩu thành công! Email đã được gửi đến nhân viên.',
                data: {
                    user_id: id,
                    username: staff.username,
                    fullname: staff.fullname,
                    email: staff.email
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Đã tạo mật khẩu mới nhưng không thể gửi email. Vui lòng kiểm tra cấu hình email.'
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}
