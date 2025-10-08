import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter?: nodemailer.Transporter;

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    // Use env SMTP if provided; otherwise create an Ethereal test account automatically
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host, port, secure: port === 465,
        auth: { user, pass },
      });
      return this.transporter;
    }

    const test = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email', port: 587, secure: false,
      auth: { user: test.user, pass: test.pass },
    });
    console.log(`[Email] Using Ethereal test account ${test.user} / ${test.pass}`);
    return this.transporter;
  }

  async sendSigninEmail(to: string, token: string) {
    const link = `${process.env.PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/verify?token=${encodeURIComponent(token)}`;
    const t = await this.getTransporter();
    const info = await t.sendMail({
      from: process.env.FROM_EMAIL || 'Solares <no-reply@solares.app>',
      to,
      subject: 'Your SOLARES sign-in link',
      text: `Tap to sign in: ${link}\n\nToken: ${token}`,
      html: `<p>Tap to sign in:</p><p><a href="${link}">${link}</a></p><p>Token: <code>${token}</code></p>`,
    });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`[Email] Preview: ${preview}`);
  }
}
