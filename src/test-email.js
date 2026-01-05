import dotenv from 'dotenv';
import { sendPasswordResetEmail } from './services/email.service.js';

dotenv.config();

async function testEmail() {
    try {
        console.log('🧪 Đang test gửi email...');
        console.log('📧 Email user:', process.env.EMAIL_USER);

        // Thay 'your-test-email@gmail.com' bằng email thật của bạn để test
        const result = await sendPasswordResetEmail(
            'ntiendung04@gmail.com',
            'Nguyễn Văn Test',
            'testuser',
            'Test123@Pass'
        );

        console.log('✅ Email gửi thành công:', result);
        console.log('🎉 Kiểm tra hộp thư của bạn!');
    } catch (error) {
        console.error('❌ Lỗi gửi email:', error.message);
        console.log('\n💡 Các vấn đề thường gặp:');
        console.log('1. Kiểm tra EMAIL_USER và EMAIL_PASS trong file .env');
        console.log('2. Đảm bảo đã bật xác minh 2 bước trên Gmail');
        console.log('3. Đảm bảo đã tạo App Password đúng cách');
        console.log('4. Xóa hết dấu cách trong App Password');
    }
}

testEmail();
