const https = require("https");

/**
 * Unified Email Service (via Resend API)
 * Bypasses SMTP port blocking on cloud providers like Render.
 */

const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY);

/**
 * Core send mail function using Resend HTTP API
 */
const sendMail = async (options) => {
  if (!isEmailConfigured()) {
    console.warn(`[EmailService] ⚠️ Skipping email to ${options.to} - RESEND_API_KEY not found in .env`);
    return;
  }

  // NOTE: Resend's free tier (onboarding@resend.dev) can only send to the email you signed up with.
  // To send to anyone, you'll need to verify a domain in the Resend dashboard.
  const payload = JSON.stringify({
    from: process.env.EMAIL_FROM || "Assetto IT <noreply@assetto.co.in>",

    to: Array.isArray(options.to) ? options.to : [options.to],
    cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
    subject: options.subject,
    html: options.html,
  });

  const requestOptions = {
    hostname: "api.resend.com",
    path: "/emails",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  console.log(`[EmailService] 📧 Sending API request: "${options.subject}" to <${options.to}>`);

  return new Promise((resolve, reject) => {
    const req = https.request(requestOptions, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const parsed = JSON.parse(responseData);
          console.log(`[EmailService] ✅ Email sent via Resend API! ID: ${parsed.id}`);
          resolve(parsed);
        } else {
          console.error(`[EmailService] ❌ Resend API Error (${res.statusCode}):`, responseData);
          reject(new Error(`Resend API returned ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error(`[EmailService] ❌ Network Error:`, error.message);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
};

module.exports = {
  sendMail,
  isEmailConfigured,
};
