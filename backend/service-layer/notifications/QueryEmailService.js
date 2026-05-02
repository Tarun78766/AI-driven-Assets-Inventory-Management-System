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
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    ...mailOptions,
  });
};

const sendQueryNotificationEmail = async (query, assigneeEmail) => {
  const targetEmail = assigneeEmail || process.env.ADMIN_EMAIL;
  await sendMail({
    to: targetEmail,
    cc: process.env.IT_TEAM_EMAIL || undefined,
    subject: `New IT Query: ${query.subject}`,
    html: `
      <h2>New IT Query Submitted</h2>
      <p><strong>Employee:</strong> ${query.employeeName} (${query.employeeEmail})</p>
      <p><strong>Type:</strong> ${query.queryType}</p>
      <p><strong>Priority:</strong> ${query.priority}</p>
      <p><strong>Subject:</strong> ${query.subject}</p>
      <p>${query.description}</p>
    `,
  });
};

const sendQueryConfirmationEmail = async (query) => {
  await sendMail({
    to: query.employeeEmail,
    subject: `Query Received: ${query.subject}`,
    html: `
      <h2>Your query has been received</h2>
      <p>Hi ${query.employeeName},</p>
      <p>Your ${query.queryType.toLowerCase()} request is now pending review.</p>
      <p><strong>Subject:</strong> ${query.subject}</p>
      <p>Expected response time is 1-2 business days.</p>
    `,
  });
};

module.exports = {
  sendQueryNotificationEmail,
  sendQueryConfirmationEmail,
};
