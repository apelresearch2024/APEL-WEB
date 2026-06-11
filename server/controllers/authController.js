import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Admin from '../models/Admin.js';

export const adminLogin = async (req, res) => {
  try {

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email.'
      });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Password.'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Authentication successful!',
      apiKey: process.env.ADMIN_SECRET_KEY
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: error.message
    });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const MASTER_EMAIL = process.env.EMAIL_USER; 
    
    if (email.toLowerCase().trim() !== MASTER_EMAIL.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized Operation: This email address does not have administrative dashboard access.'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrative record profile not found in database. Please seed the collection first.'
      });
    }

    const rawToken = crypto.randomBytes(20).toString('hex');
    admin.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 Minute window
    await admin.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendBaseUrl}/reset-password/${rawToken}`;

    const mailOptions = {
      to: admin.email,
      from: process.env.EMAIL_USER,
      subject: 'APEL Lab Dashboard - Administrative Password Reset Link',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #334155;">
          <h2 style="color: #0b1b3d;">Password Recovery Request</h2>
          <p>Please click the button below to rewrite your dashboard access credentials. This link remains active for 15 minutes:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" target="_blank" style="background-color: #0b1b3d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">Reset Dashboard Password</a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Secure reset instruction link has been dispatched to your inbox!'
    });

  } catch (error) {
    console.error('SMTP Forgot Password Failure:', error);
    return res.status(500).json({
      success: false,
      message: 'System error processing recovery operations.'
    });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Recovery window has expired or authorization token string is corrupted.'
      });
    }
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password successfully modified. You can now use the new credentials.'
    });

  } catch (error) {
    console.error('Token Update Error Sequence:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to rewrite target authentication schema structures.'
    });
  }
};
// PUT: Authenticated session rewrite for current account credentials
export const updatePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Locate administrative database record profile matches
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account structure missing.' });
    }

    // Verify historical credentials accuracy using schema bcrypt model methods
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password credentials are incorrect.' });
    }

    // Apply assignment write sequence (triggers schema model pre-save bcrypt re-hash safely)
    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Password successfully modified inside database layers.' 
    });

  } catch (error) {
    console.error('Settings Modification Failure:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Database runtime error updating account records.' 
    });
  }
};