import { sendMail, type MailMessage } from "./mailer.js";
import { env } from "../../config/env.js";

const brand = "Sevanto";
const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

function wrap(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px;color:#222">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
      <h1 style="margin:0 0 16px;font-size:22px">${escapeHtml(title)}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;color:#888;font-size:12px">${escapeHtml(brand)} · hyperlocal workforce</p>
    </div></body></html>`;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const url = `${env.APP_BASE_URL_CLIENT}/verify-email?token=${encodeURIComponent(token)}`;
  const msg: MailMessage = {
    to,
    subject: `Verify your ${brand} email`,
    text:
      `Hi ${name},\n\nWelcome to ${brand}. Please verify your email by visiting:\n${url}\n\n` +
      `This link expires in 1 hour.\n\nIf you didn't sign up, ignore this email.`,
    html: wrap(
      `Welcome to ${brand}`,
      `<p>Hi ${escapeHtml(name)},</p>
       <p>Please verify your email to activate your account:</p>
       <p><a href="${url}" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Verify email</a></p>
       <p>Or paste this link: <br><code style="word-break:break-all">${escapeHtml(url)}</code></p>
       <p>This link expires in 1 hour.</p>`,
    ),
  };
  await sendMail(msg);
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const url = `${env.APP_BASE_URL_CLIENT}/reset-password?token=${encodeURIComponent(token)}`;
  const msg: MailMessage = {
    to,
    subject: `Reset your ${brand} password`,
    text:
      `Hi ${name},\n\nWe received a request to reset your password. Visit:\n${url}\n\n` +
      `This link expires in 15 minutes. If you didn't request this, ignore this email.`,
    html: wrap(
      `Reset your password`,
      `<p>Hi ${escapeHtml(name)},</p>
       <p>We received a request to reset your password.</p>
       <p><a href="${url}" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Reset password</a></p>
       <p>This link expires in 15 minutes.</p>
       <p>If you didn't request this, you can safely ignore this email.</p>`,
    ),
  };
  await sendMail(msg);
}
