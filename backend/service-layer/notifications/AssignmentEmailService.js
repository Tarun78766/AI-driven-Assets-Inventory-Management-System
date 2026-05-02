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
    console.warn("[EmailService] Email not sent because SMTP is not configured or nodemailer is missing.");
    console.warn("Nodemailer installed:", !!nodemailer);
    console.warn("SMTP_HOST:", !!process.env.SMTP_HOST, "SMTP_USER:", !!process.env.SMTP_USER, "SMTP_PASS:", !!process.env.SMTP_PASS, "ADMIN_EMAIL:", !!process.env.ADMIN_EMAIL);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    ...mailOptions,
  });
};

const sendReturnRequestEmail = async (assignment, employee) => {
  await sendMail({
    to: employee.email,
    subject: `Action Required: Return Request for ${assignment.assetName}`,
    html: `
      <h2>Asset Return Request</h2>
      <p>Hi ${employee.firstName || employee.name},</p>
      <p>The IT department has requested the return of your assigned ${assignment.assetType.toLowerCase()}:</p>
      <p><strong>Asset:</strong> ${assignment.assetName}</p>
      <p>Please return this asset to the IT department as soon as possible. If you have any questions, please reach out to the IT team.</p>
      <p>Thank you.</p>
    `,
  });
};

module.exports = {
  sendReturnRequestEmail,
};
