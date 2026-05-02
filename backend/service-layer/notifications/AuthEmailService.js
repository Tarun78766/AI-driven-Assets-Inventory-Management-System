let nodemailer = null;

try {
  nodemailer = require("nodemailer");
} catch {
  nodemailer = null;
}

const isEmailConfigured = () =>
  Boolean(
    nodemailer &&
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.ADMIN_EMAIL,
  );

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendMail = async (mailOptions) => {
  if (!isEmailConfigured()) {
    console.warn("[AuthEmailService] Email not sent because SMTP is not configured or nodemailer is missing.");
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    ...mailOptions,
  });
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  await sendMail({
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.firstName || user.name},</p>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link is valid for 1 hour.</p>
      <br />
      <p>Thank you,</p>
      <p>IT Department</p>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};
