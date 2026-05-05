const EmailService = require("../services/EmailService");

const sendPasswordResetEmail = async (user, resetUrl) => {
  await EmailService.sendMail({
    to: user.email,
    subject: "Password Reset Request - Asset Management System",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${user.firstName || user.name},</p>
          <p>You requested a password reset for your account. Please click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
          </div>
          <p style="font-size: 14px; color: #64748b;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p style="font-size: 14px; color: #64748b;">This link is valid for 1 hour.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p>This is an automated system message. Please do not reply.</p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};

