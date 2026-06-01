import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import Application from '../models/Application.js';
import { uploadPdfToDrive } from '../config/driveService.js'; // Imports your Google Drive integration engine

const router = express.Router();

// ==========================================
// 1. CONFIGURATION & EMAIL TRANSPORTER SETUP
// ==========================================

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// Configures Multer memory buffer to catch incoming PDF streams
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Enforce 5MB ceiling constraint
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF portfolios are permitted.'), false);
    }
  }
});

// ==========================================
// 2. PUBLIC ENDPOINT: APPLICANT SUBMISSION
// ==========================================
router.post('/applications', upload.single('resume'), async (req, res) => {
  try {
    const { fullName, email, contact, vacancyId, statement } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume file is required.' });
    }

    // 1. Stream file straight to Google Drive instead of Supabase
    // This utilizes your professor's cloud storage instantly for free
    const publicDriveUrl = await uploadPdfToDrive(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 2. Save document data cleanly to your persistent MongoDB Layer
    const newApplication = await Application.create({
      vacancyId,
      applicantName: fullName,
      applicantEmail: email,
      contact,
      statement,
      resumeUrl: publicDriveUrl // Safe, permanent viewer url
    });

    // 3. Dispatch Email Notification
    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 New Candidate Application: ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #334155;">
          <div style="background-color: #0b1b3d; padding: 20px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">New Lab Position Application</h2>
          </div>
          <div style="padding: 24px; line-height: 1.6;">
            <p>Hello Admin,</p>
            <p>A new application payload has been registered inside the lab repository system. Here are the core metrics:</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p><strong>Candidate Name:</strong> ${fullName}</p>
            <p><strong>Email Identity:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Contact Route:</strong> ${contact || 'Not Provided'}</p>
            <p><strong>Target Position (ID):</strong> ${vacancyId}</p>
            <p><strong>Cover Statement:</strong></p>
            <blockquote style="background-color: #f8fafc; border-left: 4px solid #0b1b3d; padding: 12px; margin: 10px 0; font-style: italic;">
              ${statement || 'No statement submitted.'}
            </blockquote>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <div style="text-align: center; margin-top: 24px;">
              <a href="${publicDriveUrl}" target="_blank" style="background-color: #0b1b3d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
                Review Candidate Google Drive Portfolio
              </a>
            </div>
          </div>
        </div>
      `
    };

    emailTransporter.sendMail(emailOptions, (mailErr) => {
      if (mailErr) console.error('Notification Email Routing Failure:', mailErr);
    });

    return res.status(201).json({
      success: true,
      message: 'Application dossier submitted successfully!',
      data: newApplication
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. SECURE ENDPOINTS: READABLE BY ADMIN ONLY
// ==========================================

// GET: Fetch all candidate submissions
router.get('/admin/applications', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.VITE_ADMIN_SECRET_KEY;

    if (!adminToken || adminToken !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied. Unauthorized administrator authorization token.'
      });
    }

    const records = await Application.find()
      .populate('vacancyId', 'title project')
      .sort({ appliedAt: -1 });

    return res.status(200).json({ success: true, data: records });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT: Modifies selection tracks
router.put('/admin/applications/:id/status', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'];
    const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.VITE_ADMIN_SECRET_KEY;

    if (!token || token !== expectedSecret) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid administrative token.' });
    }

    const { status } = req.body;
    if (!['Pending', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status type' });
    }

    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' }
    );

    if (!updatedApp) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    return res.status(200).json({ success: true, data: updatedApp });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE: Cleans record data directly from MongoDB
router.delete('/admin/applications/:id', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'];
    const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.VITE_ADMIN_SECRET_KEY;

    if (!token || token !== expectedSecret) {
      return res.status(401).json({ success: false, message: 'Unauthorized access.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Note: To preserve historical records inside your professor's cloud drive space,
    // this removes the trace from the database index. The physical file remains on Drive.
    await Application.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Application metadata completely removed from tracking repository.'
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error processing destructive pipeline.' });
  }
});

// ==========================================
// 4. GLOBAL ERROR INTERCEPTOR
// ==========================================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: 'File size limit exceeded (Max 5MB).' });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

export default router;