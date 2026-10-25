import nodemailer from "nodemailer";

interface SendOtpEmailParams {
  toEmail: string;
  otpCode: string;
}

export async function sendOtpEmail(params: SendOtpEmailParams): Promise<{ sent: boolean; method: string; error?: string }> {
  const { toEmail, otpCode } = params;

  // 1. Check for custom SMTP configuration (Gmail, Resend, Sendgrid, etc.)
  const smtpHost = process.env.SMTP_HOST || (process.env.GMAIL_USER ? "smtp.gmail.com" : "");
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
  const smtpFrom = process.env.SMTP_FROM || `"Pastebin Lite Security" <${smtpUser || "security@pastebin-lite.app"}>`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #1e293b;">
            <h2 style="margin: 0; color: #38bdf8; font-size: 20px; font-weight: 600;">Pastebin Lite Security</h2>
          </div>
          <p style="font-size: 15px; line-height: 24px; color: #cbd5e1; margin-bottom: 20px;">
            You requested a one-time verification code to update your account password.
          </p>
          <div style="background-color: #1e293b; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; border: 1px solid #334155;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px;">Verification Code</div>
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #38bdf8; font-family: monospace;">${otpCode}</div>
          </div>
          <p style="font-size: 13px; color: #94a3b8; line-height: 20px; margin-top: 24px;">
            This code will expire in 10 minutes. If you did not request this verification code, please ignore this email or review your active account sessions immediately.
          </p>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center;">
            Pastebin Lite &bull; Fast, Private & Zero-Retention
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: `[Pastebin Lite] Your Verification Code: ${otpCode}`,
        text: `Your Pastebin Lite password change verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: htmlBody
      });

      return { sent: true, method: "smtp" };
    } catch (err) {
      console.warn("[email-service] SMTP dispatch failed:", err);
    }
  }

  // 2. Dispatch via Neon Auth built-in shared email provider
  try {
    const baseUrl =
      process.env.NEON_AUTH_BASE_URL ||
      process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL ||
      "https://ep-fancy-sun-az01xegk.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth";
    const trustedOrigin =
      process.env.NEON_AUTH_TRUSTED_ORIGIN || "https://pastebin-lite-rho-seven.vercel.app";

    const res = await fetch(`${baseUrl}/email-otp/send-verification-otp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: trustedOrigin
      },
      body: JSON.stringify({
        email: toEmail,
        type: "forget-password"
      })
    });

    if (res.ok) {
      return { sent: true, method: "neon_auth_shared" };
    }
  } catch (err) {
    console.warn("[email-service] Neon Auth shared email dispatch failed:", err);
  }

  return { sent: false, method: "none" };
}
