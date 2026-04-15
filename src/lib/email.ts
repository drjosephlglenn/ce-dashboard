import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface Attachment {
  filename: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  attachments?: Attachment[];
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Email not configured - GMAIL_USER or GMAIL_APP_PASSWORD missing");
    return null;
  }

  const info = await transporter.sendMail({
    from: `Joey Glenn <${process.env.GMAIL_USER}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    cc: params.cc,
    attachments: params.attachments,
  });

  return { id: info.messageId };
}
