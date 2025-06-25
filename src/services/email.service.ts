import nodemailer from "nodemailer";
import config from "../config";
import { logger } from "../utils/logger";

class EmailService {
  private transporter: nodemailer.Transporter | any;

  constructor() {
    console.log("📧 EmailService starting in:", config.NODE_ENV);

    if (config.NODE_ENV === "development") {
      this.createTestAccount();
    } else {
      this.transporter = nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: "apikey", // this must be literally "apikey"
          pass: config.SENDGRID_API_KEY,
        },
      });
    }
  }

  // Create test account for ethereal.email
  private async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info("✅ Created Ethereal test email account");
    } catch (error) {
      logger.error("❌ Failed to create test account:", error);
    }
  }

  // Core send method
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const mailOptions = {
        from: config.EMAIL_FROM,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (config.NODE_ENV === "development") {
        logger.info(`📨 Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        logger.info(`📬 Email sent to ${to} — Subject: "${subject}"`);
      }
    } catch (error: any) {
      logger.error("❌ Failed to send email:", error);
      if (error?.response?.body) {
        console.error("📩 SendGrid response:", error.response.body);
      }
      throw new Error("Failed to send email");
    }
  }

  // Send verification email
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${config.CLIENT_URL}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Minest!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </div>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Minest Team</p>
      </div>
    `;
    await this.sendEmail(to, "Please verify your email address", html);
  }

  // Send password reset email
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${config.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You have requested to reset your password. Please click the button below to set a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>This link will expire in 30 minutes.</p>
        <p>Best regards,<br>The Minest Team</p>
      </div>
    `;
    await this.sendEmail(to, "Password Reset Request", html);
  }

  // Send password change confirmation
  async sendPasswordChangeConfirmation(to: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed Successfully</h2>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't change your password, please contact our support team immediately.</p>
        <p>Best regards,<br>The Minest Team</p>
      </div>
    `;
    await this.sendEmail(to, "Password Changed Successfully", html);
  }

  // Send payment receipt
  async sendPaymentReceipt(to: string, name: string, planName: string, amount: number, date: Date): Promise<void> {
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Receipt</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your payment. Here's your receipt:</p>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Minest Team</p>
      </div>
    `;

    await this.sendEmail(to, "Minest Payment Receipt", html);
  }
}

export const emailService = new EmailService();
