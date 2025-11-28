import nodemailer from "nodemailer";
import { EMAIL_ADDRESS, EMAIL_PASSWORD } from "../secrets";
import { decrypt } from "./crypto";

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  const dcrepedPassword = decrypt(EMAIL_PASSWORD as string);

  const transporter = nodemailer.createTransport({
    host: EMAIL_ADDRESS,
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_ADDRESS,
      pass: dcrepedPassword,
    },
  });

  await transporter.sendMail({
    from: `"${EMAIL_ADDRESS}" <${EMAIL_ADDRESS}>`,
    to,
    subject,
    html,
  });
};
