import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendMail(input: SendMailInput) {
    const providerUrl = this.config.get<string>('EMAIL_PROVIDER_URL');
    const providerToken = this.config.get<string>('EMAIL_PROVIDER_TOKEN');
    const from = this.config.get<string>('EMAIL_FROM', 'noreply@wedify.local');

    if (providerUrl) {
      const response = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(providerToken ? { Authorization: `Bearer ${providerToken}` } : {}),
        },
        body: JSON.stringify({
          from,
          to: input.to,
          subject: input.subject,
          text: input.text,
          html: input.html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Email provider failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return {
        provider: 'http',
        success: true,
        messageId: response.headers.get('x-message-id') ?? undefined,
      };
    }

    this.logger.warn(
      `Email provider not configured. Logging email instead. To: ${input.to} | Subject: ${input.subject}`,
    );
    this.logger.log(`${input.text}\n${input.html ?? ''}`);

    return { provider: 'log', success: true };
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const appUrl = this.config.get<string>('APP_BASE_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

    await this.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu Wedify',
      text: `Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Wedify. Vui lòng truy cập liên kết sau: ${resetUrl}\n\nNếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <p>Xin chào,</p>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Wedify.</p>
          <p><a href="${resetUrl}" style="display:inline-block; padding:10px 16px; background:#f25f7c; color:#fff; text-decoration:none; border-radius:8px;">Đặt lại mật khẩu</a></p>
          <p>Nếu liên kết không hoạt động, copy đường dẫn sau vào trình duyệt:</p>
          <p>${resetUrl}</p>
          <p>Liên kết này có hiệu lực trong 1 giờ.</p>
        </div>
      `,
    });
  }

  async sendEmailVerificationEmail(email: string, token: string) {
    const appUrl = this.config.get<string>('APP_BASE_URL', 'http://localhost:3000');
    const verifyUrl = `${appUrl.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;

    await this.sendMail({
      to: email,
      subject: 'Xác minh email Wedify',
      text: `Vui lòng xác minh email của bạn bằng cách truy cập: ${verifyUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <p>Xin chào,</p>
          <p>Để hoàn tất đăng ký, vui lòng xác minh email của bạn.</p>
          <p><a href="${verifyUrl}" style="display:inline-block; padding:10px 16px; background:#0ea5e9; color:#fff; text-decoration:none; border-radius:8px;">Xác minh email</a></p>
          <p>Nếu bạn không thực hiện thao tác này, vui lòng bỏ qua email.</p>
        </div>
      `,
    });
  }
}
