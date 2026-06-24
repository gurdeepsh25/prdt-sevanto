import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env.js";
import { logger } from "../logger/logger.js";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    auth: env.MAIL_USER
      ? { user: env.MAIL_USER, pass: env.MAIL_PASS }
      : undefined,
  });
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email. Errors are logged but never thrown to callers —
 * transactional mail must not block user-facing flows.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  try {
    const info = await getTransporter().sendMail({
      from: env.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    logger.info(
      { messageId: info.messageId, to: message.to, subject: message.subject },
      "mail sent",
    );
  } catch (err) {
    logger.error(
      { err, to: message.to, subject: message.subject },
      "mail send failed",
    );
  }
}
