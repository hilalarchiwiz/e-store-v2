import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || "Ecomare Support"}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export function describeEmailError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === "EAUTH") return "SMTP authentication failed. Check SMTP_USER and SMTP_PASS on the server. Gmail requires a valid App Password.";
  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "EDNS"].includes(code || "")) {
    return "Cannot connect to the SMTP server. Check the host, port, TLS settings, and hosting network access.";
  }
  return "The mail server could not complete the request. Check the server mail configuration.";
}

export async function verifyEmailConnection() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { success: false, message: "SMTP_USER and SMTP_PASS must be set on the running server." };
  }
  try {
    await transporter.verify();
    return { success: true, message: "SMTP connection and login succeeded. This check does not send an email or confirm inbox delivery." };
  } catch (error) {
    return { success: false, message: describeEmailError(error) };
  }
}
