'use strict';
// Service for sending emails using Mailjet
const Mailjet = require('node-mailjet');
// Initialize Mailjet client with API keys from environment variables
function getMailjetClient() {
  const { MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE } = process.env;
  if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
    throw new Error('Mailjet API keys are not configured');
  }
  return Mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);
}
// Send a "Forgot Password" email with reset link
// to the specified email address, using Mailjet, with basic HTML content
async function sendForgotPasswordMail({ toEmail, toName, host, resetLink }) {
  const mailjet = getMailjetClient();
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.MJ_FROM_EMAIL || 'no-reply@tivivu.app',
          Name: process.env.MJ_FROM_NAME || 'TiViVu'
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
  return request;
}

module.exports = {
  sendForgotPasswordMail
};
