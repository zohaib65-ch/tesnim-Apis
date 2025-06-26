import nodemailer from "nodemailer";
import axios from "axios";
import { logger } from "../utils/logger";

class EmailService {
  constructor() {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not set in environment variables");
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is not set in environment variables");
    }
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const from = process.env.EMAIL_FROM!;
    const senderName = from.split("@")[0];

    console.log({ from, senderName, to, subject, html, key: process.env.BREVO_API_KEY });

    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: senderName,
            email: from,
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY!,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      logger.info("✅ Production email sent via Brevo:", response.data);
    } catch (error: any) {
      logger.error("❌ Email sending failed (Brevo):", error.response?.data || error.message);
      throw new Error("Failed to send email in production mode");
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Minest!</h2>
        <p>Please verify your email by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </div>
        <p>This link will expire in 24 hours.</p>
      </div>
    `;
    await this.sendEmail(to, "Please verify your email address", html);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>This link will expire in 30 minutes.</p>
      </div>
    `;
    await this.sendEmail(to, "Password Reset Request", html);
  }

  async sendPasswordChangeConfirmation(to: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed</h2>
        <p>Your password was changed successfully. If this wasn’t you, please contact support immediately.</p>
      </div>
    `;
    await this.sendEmail(to, "Password Changed Successfully", html);
  }

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
        <p>Thank you for your payment.</p>
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
        </div>
      </div>
    `;
    await this.sendEmail(to, "Minest Payment Receipt", html);
  }
}

export const emailService = new EmailService();
