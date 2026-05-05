const nodemailer = require("nodemailer");

/**
 * Unified Email Service
 * Handles SMTP configuration and provides helper methods for sending various system emails.
 */

const isEmailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Helps with some shared hosting/dev environments
  },
});

// Verify connection on startup
if (isEmailConfigured()) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("[EmailService] SMTP Connection Error:", error.message);
    } else {
      console.log("[EmailService] SMTP Server is ready to take messages");
    }
  });
} else {
  console.warn("[EmailService] Email configuration is missing. Emails will not be sent.");
}

/**
 * Core send mail function
 */
const sendMail = async (options) => {
  if (!isEmailConfigured()) {
    console.warn(`[EmailService] Skipping email to ${options.to} - SMTP not configured.`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Asset Management System" <${process.env.SMTP_USER}>`,
    to: options.to,
    cc: options.cc,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${options.to}:`, error.message);
    throw error;
  }
};

module.exports = {
  sendMail,
  isEmailConfigured,
};
