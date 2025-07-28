import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail", // Or another email provider
  auth: {
    user: "ar1428391@gmail",
    pass: "your-email-password",
  },
});

const mailOptions = {
  from: "your-email@gmail.com",
  to: "recipient@example.com",
  subject: "Hello from Node.js",
  text: "This is a test email sent using Nodemailer.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
