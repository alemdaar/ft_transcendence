import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export async function sendVerificationEmail(email: string, code: string) {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Verify your email",
        text: `Your verification code is: ${code}`
    });
}