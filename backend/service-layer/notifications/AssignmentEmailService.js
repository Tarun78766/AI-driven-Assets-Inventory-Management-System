const EmailService = require("../services/EmailService");

const sendReturnRequestEmail = async (assignment, employee) => {
  await EmailService.sendMail({
    to: employee.email,
    subject: `Asset Return Request: ${assignment.assetName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f59e0b; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Asset Return Request</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${employee.firstName || employee.name},</p>
          <p>The IT department has requested the return of your assigned ${assignment.assetType.toLowerCase()}:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 5px 0;"><strong>Asset:</strong> ${assignment.assetName}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${assignment.assetType}</p>
          </div>
          <p>Please return this asset to the IT department as soon as possible. If you have any questions or if there is a problem returning this asset, please contact the IT team immediately.</p>
          <p>Thank you for your cooperation.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p>Asset Management System | IT Department</p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendReturnRequestEmail,
};

