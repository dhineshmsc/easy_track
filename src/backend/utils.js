import nodemailer from 'nodemailer';

if (!global._otpStore) {
  global._otpStore = {};
}
const otpStore = global._otpStore;

export function generateOtp(email) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore[email] = otp;
  console.log(`\n[OTP DEBUG] Generated OTP for ${email}: ${otp}\n`);
  return otp;
}

export function verifyStoredOtp(email, submittedOtp) {
  const storedOtp = otpStore[email];
  if (storedOtp && storedOtp === String(submittedOtp).trim()) {
    return true;
  }
  return false;
}

// Mailer transporter setup
function getTransporter() {
  const server = process.env.SMTP_SERVER || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const username = process.env.SMTP_USERNAME || '';
  const password = process.env.SMTP_PASSWORD || '';

  if (!username || !password) {
    return null;
  }

  return nodemailer.createTransport({
    host: server,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: username,
      pass: password,
    },
  });
}

export async function sendOtpEmail(email, otp, name) {
  const senderEmail = process.env.SENDER_EMAIL || '';
  const transporter = getTransporter();

  if (!transporter || !senderEmail) {
    console.log(`\n==================================================`);
    console.log(` MOCK OTP SENT TO: ${email}`);
    console.log(` OTP CODE: ${otp}`);
    console.log(`==================================================\n`);
    return true;
  }

  const greetingName = name || 'there';
  const mailOptions = {
    from: senderEmail,
    to: email,
    subject: 'Your Easy Track Verification Code',
    text: `Hello ${greetingName},\n\nYour 6-digit verification code is: ${otp}\n\nPlease enter this code to verify your email.\n\nThanks,\nEasy Track Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email, password, name) {
  const senderEmail = process.env.SENDER_EMAIL || '';
  const transporter = getTransporter();

  if (!transporter || !senderEmail) {
    console.log(`\n==================================================`);
    console.log(` MOCK WELCOME EMAIL SENT TO: ${email}`);
    console.log(` GENERATED PASSWORD: ${password}`);
    console.log(`==================================================\n`);
    return true;
  }

  const greetingName = name || 'there';
  const mailOptions = {
    from: senderEmail,
    to: email,
    subject: 'Welcome to Easy Track - Your Account Details',
    text: `Welcome to Easy Track, ${greetingName}!\n\nYour account has been successfully created. You can now log in to the portal using your email address and the auto-generated password below.\n\nEmail: ${email}\nPassword: ${password}\n\nWe recommend changing this password after your first login.\n\nBest regards,\nThe Easy Track Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}
