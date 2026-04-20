import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Gmail transporter using App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"PJ Finance" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} — Your PJ Finance Login OTP`,
    html: `
      <div style="font-family: 'Segoe UI', Helvetica, sans-serif; max-width: 480px; margin: 0 auto; background: #111; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #111 100%); padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #222;">
          <div style="width: 56px; height: 56px; background: #FFD700; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 28px; line-height: 1;">💰</span>
          </div>
          <h1 style="color: #fff; font-size: 22px; font-weight: 800; margin: 0;">PJ Finance</h1>
          <p style="color: #666; font-size: 13px; margin: 4px 0 0;">Admin Login Verification</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <p style="color: #aaa; font-size: 14px; margin: 0 0 24px;">
            Your one-time password to access PJ Finance Admin Panel:
          </p>

          <!-- OTP Box -->
          <div style="background: #1a1a1a; border: 2px dashed #FFD700; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="letter-spacing: 14px; font-size: 42px; font-weight: 900; color: #FFD700; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>

          <div style="background: #1a1a1a; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.6;">
              ⏱ This OTP is valid for <strong style="color: #fff;">10 minutes</strong> only.<br>
              🔒 Do not share this OTP with anyone.<br>
              ❌ If you didn't request this, ignore this email.
            </p>
          </div>

          <p style="color: #555; font-size: 12px; text-align: center; margin: 0;">
            © 2026 PJ Finance · Loan Collection Management
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
