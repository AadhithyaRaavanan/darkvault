import nodemailer from "nodemailer";

const OWNER_EMAIL = process.env.OWNER_EMAIL!;
const OWNER_EMAIL_PASSCODE = process.env.OWNER_EMAIL_PASSCODE!;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: OWNER_EMAIL,
    pass: OWNER_EMAIL_PASSCODE,
  },
});

export async function sendOwnerOTPEmail(otp: string, telegramId: string) {
  const mailOptions = {
  from: OWNER_EMAIL,
  to: OWNER_EMAIL,
  subject: "💀 DarkVault Owner OTP Verification",
  html: `
    <div style="font-family: 'Courier New', monospace; background-color: #0d0d0d; color: #00ff00; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ff00ff; margin-bottom: 10px;">⚡ DarkVault – New User Request ⚡</h2>
      <p>A new user has requested access to your DarkVault.</p>
      <table style="border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="font-weight: bold; padding: 5px 10px; color: #00ffff;">Telegram ID:</td>
          <td style="padding: 5px 10px;">${telegramId}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 5px 10px; color: #ff4500;">OTP:</td>
          <td style="padding: 5px 10px; font-weight: bold; color: #00ff00; font-size: 1.2em;">${otp}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 5px 10px; color: #00ffff;">Expires In:</td>
          <td style="padding: 5px 10px;">45 seconds</td>
        </tr>
      </table>
      <p style="margin-top: 15px; color: #ff00ff;">Provide this OTP to the user for verification. ⏱️</p>
      <hr style="border: none; border-top: 1px solid #00ff00; margin: 20px 0;">
      <p style="font-size: 0.8em; color: #888;">
        This is an automated message from DarkVault. Do not reply directly.
      </p>
    </div>
  `,
};


  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending Owner OTP email:", error);
    throw error;
  }
}
