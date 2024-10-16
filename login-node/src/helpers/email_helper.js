const nodemailer = require('nodemailer');

const sendVerificationEmail = async (userEmail, token) => {
    console.log(userEmail)
    console.log(process.env.EMAIL)
    const verificationUrl = `${process.env.BASE_URL}verify-email/${token}`; // URL xác thực
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Email của bạn
        pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng
      },
    });
  
    const mailOptions = {
      from: '"MyApp" <noreply@myapp.com>',
      to: userEmail,
      subject: 'Xác thực Email của bạn',
      html: `<p>Vui lòng nhấp vào liên kết dưới đây để xác thực tài khoản của bạn:</p>
             <a href="${verificationUrl}">${verificationUrl}</a>`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email xác thực đã được gửi!');
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw new Error('Không thể gửi email xác thực');
    }
  };

module.exports = sendVerificationEmail;
