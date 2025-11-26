const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
  // For production, use environment variables
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // For development, use a test account or console logging
  console.log('Email service: Using development mode (emails will be logged)');
  return null;
};

const transporter = createTransporter();

const emailService = {
  async sendEmail({ to, subject, html, text }) {
    if (!transporter) {
      // Development mode - just log
      console.log('\n📧 EMAIL (DEV MODE):');
      console.log('To:', Array.isArray(to) ? to.join(', ') : to);
      console.log('Subject:', subject);
      console.log('Body:', text || html);
      console.log('---\n');
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Church Manager" <noreply@churchmanager.com>',
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, error: error.message };
    }
  },

  async sendWelcomeEmail(user, churchName) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4A90E2;">Welcome to Church Manager!</h1>
        <p>Hello ${user.firstName},</p>
        <p>Your account has been created for <strong>${churchName}</strong>.</p>
        <p>You can now log in and start managing your church community.</p>
        <p style="color: #666;">
          Best regards,<br>
          The Church Manager Team
        </p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Welcome to Church Manager - ${churchName}`,
      html,
      text: `Welcome to Church Manager, ${user.firstName}! Your account for ${churchName} has been created.`,
    });
  },

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4A90E2;">Password Reset Request</h1>
        <p>Hello ${user.firstName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.<br>
          This link will expire in 1 hour.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Church Manager',
      html,
      text: `Reset your password by visiting: ${resetUrl}`,
    });
  },

  async sendEventReminder(user, event) {
    const eventDate = new Date(event.startDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4A90E2;">Event Reminder</h1>
        <p>Hello ${user.firstName},</p>
        <p>This is a reminder about the upcoming event:</p>
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px; color: #333;">${event.title}</h2>
          <p style="margin: 0; color: #666;">📅 ${eventDate}</p>
          ${event.location ? `<p style="margin: 5px 0 0; color: #666;">📍 ${event.location}</p>` : ''}
        </div>
        <p>We look forward to seeing you there!</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Reminder: ${event.title}`,
      html,
      text: `Reminder: ${event.title} on ${eventDate}`,
    });
  },

  async sendDonationReceipt(donor, donation, churchName) {
    const donationDate = new Date(donation.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const amount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: donation.currency || 'USD',
    }).format(donation.amount);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4A90E2;">Donation Receipt</h1>
        <p>Dear ${donor.firstName},</p>
        <p>Thank you for your generous donation to <strong>${churchName}</strong>.</p>
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 18px; color: #27AE60;">${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Date:</td>
              <td style="padding: 8px 0; text-align: right;">${donationDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Type:</td>
              <td style="padding: 8px 0; text-align: right; text-transform: capitalize;">${donation.type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Method:</td>
              <td style="padding: 8px 0; text-align: right; text-transform: capitalize;">${donation.method.replace('_', ' ')}</td>
            </tr>
          </table>
        </div>
        <p style="color: #666; font-size: 14px;">
          This receipt is for your records. Please consult with your tax advisor regarding the deductibility of your contribution.
        </p>
        <p>
          God bless you,<br>
          ${churchName}
        </p>
      </div>
    `;

    return this.sendEmail({
      to: donor.email,
      subject: `Donation Receipt - ${churchName}`,
      html,
      text: `Thank you for your donation of ${amount} to ${churchName} on ${donationDate}.`,
    });
  },

  async sendAnnouncement(recipients, announcement, churchName) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%); padding: 30px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">📢 ${announcement.subject}</h1>
        </div>
        <div style="padding: 30px; background: #fff; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 8px 8px;">
          ${announcement.body.split('\n').map(p => `<p>${p}</p>`).join('')}
          <hr style="border: none; border-top: 1px solid #e1e8ed; margin: 30px 0;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            ${churchName}<br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #4A90E2;">View in Church Manager</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: recipients,
      subject: `[${churchName}] ${announcement.subject}`,
      html,
      text: `${announcement.subject}\n\n${announcement.body}`,
    });
  },
};

module.exports = emailService;


