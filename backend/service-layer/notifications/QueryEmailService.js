const EmailService = require("../services/EmailService");

const sendQueryNotificationEmail = async (query, assigneeEmail) => {
  const targetEmail = assigneeEmail || process.env.ADMIN_EMAIL;
  await EmailService.sendMail({
    to: targetEmail,
    cc: process.env.IT_TEAM_EMAIL || undefined,
    subject: `New IT Query: ${query.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">New IT Query Submitted</h1>
        </div>
        <div style="padding: 20px;">
          <p>A new support request has been submitted and needs your attention.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${query.employeeName} (${query.employeeEmail})</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${query.queryType}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> ${query.priority}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${query.subject}</p>
          </div>
          <p><strong>Description:</strong></p>
          <p style="white-space: pre-wrap; background: #f1f5f9; padding: 10px; border-radius: 4px;">${query.description}</p>
          <p>Please review this query and take appropriate action.</p>
        </div>
      </div>
    `,
  });
};

const sendQueryConfirmationEmail = async (query) => {
  await EmailService.sendMail({
    to: query.employeeEmail,
    subject: `Query Received: ${query.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Query Received</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${query.employeeName},</p>
          <p>Your support request has been successfully received and is now pending review by our IT team.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${query.subject}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${query.queryType}</p>
          </div>
          <p>Expected response time is 1-2 business days. You will receive another email when your query status is updated.</p>
          <p>Thank you for your patience.</p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendQueryNotificationEmail,
  sendQueryConfirmationEmail,
};

