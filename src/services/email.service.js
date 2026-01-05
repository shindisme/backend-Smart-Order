import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// cấu hình transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});


// transporter.verify(function (error, success) {
//     if (error) {
//         console.log('Lỗi gửi mail:', error.message);
//     } else {
//         console.log('Mail sẵn sàng gửi thư');
//     }
// });

export async function sendPasswordResetEmail(email, fullname, username, newPassword) {
    try {
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'Hệ thống quản lý'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mật khẩu mới cho tài khoản của bạn',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #0B3C60;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%);
                            color: #0B3C60;
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                        }
                        .content {
                            padding: 30px 20px;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #333;
                            margin-bottom: 20px;
                        }
                        .info-box {
                            background-color: #f5f5f5f5;
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .info-box p {
                            margin: 10px 0;
                        }
                        .info-box strong {
                            color: #0B3C60;
                        }
                        .password {
                            background-color: #fff3cd;
                            color: #856404;
                            font-size: 20px;
                            font-weight: bold;
                            padding: 15px;
                            border-radius: 5px;
                            text-align: center;
                            letter-spacing: 2px;
                            margin: 15px 0;
                        }
                        .warning-box {
                            background-color: #fff3cd;
                            border: 1px solid #ffc107;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .warning-box ul {
                            margin: 10px 0;
                            padding-left: 20px;
                        }
                        .warning-box li {
                            margin: 5px 0;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Cấp Lại Mật Khẩu</h1>
                        </div>
                        
                        <div class="content">
                            <p class="greeting">Xin chào <strong>${fullname}</strong>,</p>
                            
                            <p>Mật khẩu của bạn đã được cấp lại thành công.</p>
                            
                            <div class="info-box">
                                <p><strong>Tài khoản:</strong> ${username}</p>
                                <p><strong>Mật khẩu mới:</strong></p>
                                <div class="password">${newPassword}</div>
                            </div>
                            
                            <div class="warning-box">
                                <p><strong>Lưu ý quan trọng:</strong></p>
                                <ul>
                                    <li>Vui lòng đổi mật khẩu ngay sau khi đăng nhập</li>
                                    <li>Không chia sẻ mật khẩu này với bất kỳ ai</li>
                                    <li>Email này chỉ gửi một lần duy nhất</li>
                                    <li>Nếu bạn không yêu cầu cấp lại mật khẩu, vui lòng liên hệ quản trị viên ngay</li>
                                </ul>
                            </div>
                            
                            <p>Nếu bạn gặp bất kỳ vấn đề gì, vui lòng liên hệ với bộ phận hỗ trợ.</p>
                        </div>
                        
                        <div class="footer">
                            <p>Trân trọng,<br/><strong>${process.env.APP_NAME || 'Hệ thống quản lý'}</strong></p>
                            <p style="font-size: 12px; color: #999;">Email này được gửi tự động, vui lòng không trả lời.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        throw new Error('Không thể gửi email.');
    }
}

export async function sendNewAccountEmail(email, fullname, username, password) {
    try {
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'Hệ thống quản lý'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Chào mừng!!!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #FFDFBA 0%, #FFB3BA 100%); color: #0B3C60; padding: 20px; text-align: center; border-radius: 5px; }
                        .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 5px; }
                        .info-box { background-color: #f5f5f5f5;color: #0B3C60; padding: 15px; margin: 15px 0; }
                        .password { background-color: #fff3cd; color: #856404; font-size: 18px; font-weight: bold; padding: 10px; text-align: center; margin: 10px 0; letter-spacing: 2px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Chào mừng bạn!</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>${fullname}</strong>,</p>
                            <p>Tài khoản của bạn đã được tạo thành công.</p>
                            <div class="info-box">
                                <p><strong>Tài khoản:</strong> ${username}</p>
                                <p><strong>Mật khẩu:</strong></p>
                                <div class="password">${password}</div>
                            </div>
                            <p><strong>Lưu ý:</strong> Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
