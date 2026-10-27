import nodemailer from "nodemailer";
import { HttpError } from "../lib/http-error";

const transporter = nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

async function send(email: string, subject: string, text: string) {
    try {
        await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject, text });
    } catch {
        throw new HttpError(503, "Unable to send email. Please try again later.");
    }
}

export function sendVerificationEmail(email: string, code: string) {
    return send(email, "Verify your email", `Your verification code is: ${code}\nIt expires in five minutes.`);
}

export function sendPasswordResetEmail(email: string, token: string) {
    // The token is submitted by the frontend to POST /auth/reset-password.
    return send(email, "Reset your password", `Your password reset token is: ${token}\nIt expires in 15 minutes. If you did not request this, ignore this email.`);
}
