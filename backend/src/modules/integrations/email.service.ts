import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    if (!smtpHost || !smtpPort) {
      this.logger.warn('Email service not configured. SMTP settings missing.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: smtpUser && smtpPassword ? {
          user: smtpUser,
          pass: smtpPassword,
        } : undefined,
      });

      this.logger.log('Email service initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize email service: ${error.message}`);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email not sent - transporter not initialized');
      return false;
    }

    try {
      const from = this.configService.get<string>('EMAIL_FROM', 'noreply@appsec.local');

      await this.transporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendAlertEmail(message: string, recipients: string[]): Promise<boolean> {
    return this.sendEmail({
      to: recipients,
      subject: 'AppSec Alert - New Security Findings',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">AppSec Intelligence Dashboard Alert</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1f2937;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from the AppSec Intelligence Dashboard.
            Please do not reply to this email.
          </p>
        </div>
      `,
      text: message,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

    return this.sendEmail({
      to: email,
      subject: 'AppSec Dashboard - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Password Reset Request</h2>
          <p style="color: #1f2937;">
            You requested to reset your password for the AppSec Intelligence Dashboard.
          </p>
          <p style="color: #1f2937;">
            Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this, please ignore this email. The link will expire in 1 hour.
          </p>
          <p style="color: #9ca3af; font-size: 12px;">
            Or copy and paste this URL into your browser: ${resetUrl}
          </p>
        </div>
      `,
      text: `Reset your password by visiting: ${resetUrl}`,
    });
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }
}
