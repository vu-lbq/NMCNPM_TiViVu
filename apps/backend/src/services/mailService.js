'use strict';
// Dịch vụ gửi email sử dụng Mailjet
const Mailjet = require('node-mailjet');

// Khởi tạo client Mailjet với API key từ biến môi trường
function getMailjetClient() {
  const { MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE } = process.env;
  if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
    throw new Error('Mailjet API keys are not configured');
  }
  return Mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);
}

// Gửi email "Quên mật khẩu" kèm liên kết đặt lại
// đến địa chỉ email chỉ định, dùng Mailjet với nội dung HTML cơ bản
async function sendForgotPasswordMail({ toEmail, toName, host, resetLink }) {
  const mailjet = getMailjetClient();
  const fromEmail = process.env.MJ_FROM_EMAIL || 'no-reply@tivivu.app';
  const fromName = process.env.MJ_FROM_NAME || 'TiViVu';

  // Kiểm tra định dạng email người gửi tối thiểu
  const senderEmailPattern = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;
  if (!senderEmailPattern.test(fromEmail)) {
    throw new Error(
      `Invalid sender email configured: ${fromEmail}. Set MJ_FROM_EMAIL to a valid domain email (e.g., noreply@yourdomain.com).`
    );
  }

  try {
    const request = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: fromName
            },
            To: [
              {
                Email: toEmail,
                Name: toName || toEmail
              }
            ],
            Subject: '[TiViVu] Reset Your Password',
            HTMLPart: `
              <p>Hi ${toName || ''},</p>
              <p>You requested to reset the password for your ${host} account. Click the link below to proceed.</p>
              <p><a href="${resetLink}">Reset Password</a></p>
              <p>If you did not request this, you can safely ignore this email. This link is valid for 30 minutes.</p>
              <p>Thanks,<br/>TiViVu Team</p>
            `
          }
        ]
      });

    // Log chi tiết phản hồi Mailjet
    const status = request?.response?.status;
    const body = request?.response?.data;
    console.log('Mailjet send response:', { status, body });

    if (status && status >= 200 && status < 300) {
      return { ok: true, status, body };
    }
    throw new Error(
      `Mailjet send failed with status ${status || 'unknown'}: ${JSON.stringify(body)}`
    );
  } catch (err) {
    // Ghi log lỗi chi tiết từ Mailjet
    const statusCode = err?.statusCode || err?.response?.status;
    const statusMessage = err?.response?.res?.statusMessage || err?.message;
    const errorBody = err?.response?.body || err?.response?.data;
    const composed = {
      msg: 'Mailjet send error',
      statusCode,
      statusMessage,
      errorBody
    };
    console.error('Mailjet error details:', composed);

    // Ném lỗi mô tả rõ ràng cho controller
    throw new Error(
      `Mailjet error ${statusCode || ''} ${statusMessage || ''}: ${errorBody ? JSON.stringify(errorBody) : ''}`
    );
  }
}

module.exports = {
  sendForgotPasswordMail
};