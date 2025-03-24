import nodemailer from "nodemailer";

export const sendAudioEmail = async (toEmail: string, downloadUrl: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or 'hotmail', 'yahoo', or use SMTP settings for a custom domain
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Limi Subliminals" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your personalized subliminal is ready! 🎧",
    html: `
      <p>Hi there,</p>
      <p>Your personalized subliminal audio has been generated successfully. Click the link below to download:</p>
      <p><a href="${downloadUrl}">${downloadUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>Enjoy! 🌙</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
