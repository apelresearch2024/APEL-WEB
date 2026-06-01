import express from 'express';
import multer from 'multer';
import Scholar from '../models/Scholar.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadPdfToDrive } from '../config/driveService.js';
import PDFDocument from 'pdfkit';

const scholarRouter = express.Router();

// Configure local Multer memory storage to capture the file buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. GET Current Scholars Only (Excludes Alumni)
scholarRouter.get('/', async (req, res) => {
  try {
    // Filters out alumni so only active lab members load on the main roster
    const scholars = await Scholar.find({ status: { $ne: 'Alumni' } }).sort({ joinedYear: 1, createdAt: 1 });
    res.status(200).json({ success: true, data: scholars });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error while fetching data.' });
  }
});

// 2. GET Live Alumni PDF Document
scholarRouter.get('/alumni/pdf', async (req, res) => {
  try {
    const alumni = await Scholar.find({ status: 'Alumni' }).sort({ graduationYear: -1, joinedYear: -1 });

    const doc = new PDFDocument({ size: 'A4', margin: 50 }); // Utilizing standard A4 structure

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=APEL_Lab_Alumni_Roster.pdf');
    doc.pipe(res);

    // Document Header Styling
    doc.fillColor('#0b1b3d').fontSize(22).font('Helvetica-Bold').text('APEL Research Laboratory', { align: 'center' });
    doc.fontSize(11).font('Helvetica-Oblique').fillColor('#64748b').text('Applied Power Electronics Lab, IIT Roorkee', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Alumni & Past Scholars Roster', { align: 'center' });
    doc.moveDown(2);

    // Define Precise Column Grid Widths
    const colX = { name: 50, role: 180, tenure: 265, domain: 345, link: 495 };
    const colWidths = { name: 125, role: 80, tenure: 75, domain: 145, link: 50 };

    // Render Table Header Line
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.4);

    let currentY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0b1b3d');
    doc.text('Scholar Name', colX.name, currentY, { width: colWidths.name });
    doc.text('Designation', colX.role, currentY, { width: colWidths.role });
    doc.text('Lab Tenure', colX.tenure, currentY, { width: colWidths.tenure });
    doc.text('Research Focus Domain', colX.domain, currentY, { width: colWidths.domain });
    doc.text('Profile', colX.link, currentY, { width: colWidths.link, align: 'right' });

    doc.moveDown(0.5);
    doc.strokeColor('#94a3b8').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    // Render Dynamic Rows
    if (alumni.length === 0) {
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('No archived alumni profiles are currently recorded in the registry.', 50, doc.y, { align: 'center' });
    } else {
      alumni.forEach((person) => {
        currentY = doc.y;

        // Dynamic page breakdown safety margin guard
        if (currentY > 740) {
          doc.addPage();
          currentY = 50; 
        }

        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#1e293b');
        doc.text(person.name, colX.name, currentY, { width: colWidths.name, lineBreak: false, ellipsis: true });

        doc.font('Helvetica').fillColor('#475569');
        doc.text(person.role || 'Ph.D. Scholar', colX.role, currentY, { width: colWidths.role, lineBreak: false, ellipsis: true });

        const timeline = person.graduationYear ? `${person.joinedYear} – ${person.graduationYear}` : `${person.joinedYear} – Passed`;
        doc.text(timeline, colX.tenure, currentY, { width: colWidths.tenure, lineBreak: false, ellipsis: true });

        doc.font('Helvetica-Oblique').fillColor('#334155');
        doc.text(person.researchTopic || 'Power Systems Architecture', colX.domain, currentY, { width: colWidths.domain, lineBreak: false, ellipsis: true });

        if (person.linkedinUrl) {
          doc.font('Helvetica-Bold').fillColor('#0284c7').text('[Link]', colX.link, currentY, {
            width: colWidths.link,
            align: 'right',
            link: person.linkedinUrl,
            underline: true
          });
        } else {
          doc.font('Helvetica').fillColor('#cbd5e1').text('—', colX.link, currentY, { width: colWidths.link, align: 'right' });
        }

        doc.moveDown(1.4); 
      });
    }

    doc.end();

  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ success: false, message: 'PDF Generation Failed' });
  }
});

// 3. POST New Scholar
scholarRouter.post('/', protect, upload.single('imageFile'), async (req, res) => {
  try {
    const { name, email, role, joinedYear, researchTopic, linkedinUrl, status, graduationYear } = req.body;

    let uploadedData = null; 
    
    if (req.file) {
      const driveResponse = await uploadPdfToDrive(req.file.buffer, req.file.originalname, req.file.mimetype);
      uploadedData = {
        id: driveResponse.id,
        webViewLink: driveResponse.webViewLink
      };
    }

    const newScholar = await Scholar.create({
      name,
      email,
      role,
      joinedYear,
      researchTopic,
      linkedinUrl,
      imageUrl: uploadedData,
      status: status || 'Current',
      graduationYear: graduationYear ? Number(graduationYear) : null
    });

    res.status(201).json({ success: true, message: 'Profile registered successfully.', data: newScholar });
  } catch (err) {
    console.error("Scholar Route Error:", err);
    res.status(400).json({
      success: false,
      message: err.code === 11000 ? 'Email address already assigned.' : err.message
    });
  }
});

// 4. PATCH Transition Scholar to Alumnus Status
scholarRouter.patch('/:id/status', protect, async (req, res) => {
  try {
    const { graduationYear } = req.body;

    const updatedScholar = await Scholar.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Alumni',
        graduationYear: graduationYear ? Number(graduationYear) : new Date().getFullYear()
      },
      { returnDocument: 'after' }
    );

    if (!updatedScholar) return res.status(404).json({ success: false, message: 'Profile not found.' });

    res.status(200).json({ success: true, message: 'Scholar archived to alumni roster successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE Scholar Record Completely
scholarRouter.delete('/:id', protect, async (req, res) => {
  try {
    const scholar = await Scholar.findByIdAndDelete(req.params.id);
    if (!scholar) return res.status(404).json({ success: false, message: 'Target profile not found.' });

    res.status(200).json({ success: true, message: 'Profile deleted successfully.' });
  } catch (err) {
    const status = err.name === 'CastError' ? 400 : 500;
    res.status(status).json({ success: false, message: err.name === 'CastError' ? 'Invalid ID format.' : err.message });
  }
});

// 6. Edit Scholar Record
// 🔥 FIXED: Standardized auth guard with `protect` and normalized Google Drive object mapping
scholarRouter.put('/:id', protect, upload.single('imageFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, role, email, status, joinedYear,
      graduationYear, linkedinUrl, researchTopic
    } = req.body;

    const updateFields = {
      name,
      role,
      email,
      status,
      joinedYear: parseInt(joinedYear),
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      linkedinUrl,
      researchTopic
    };

    // If a fresh image file asset is sent during modification, sync it to Drive
    if (req.file) {
      const driveResponse = await uploadPdfToDrive(req.file.buffer, req.file.originalname, req.file.mimetype);
      
      // 🔥 FIX: Mapping structural object logic to match POST route behavior
      updateFields.imageUrl = {
        id: driveResponse.id,
        webViewLink: driveResponse.webViewLink
      };
    }

    const updatedScholar = await Scholar.findByIdAndUpdate(
      id,
      updateFields,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedScholar) {
      return res.status(404).json({ success: false, message: 'Scholar profile not found.' });
    }

    return res.status(200).json({ success: true, message: 'Profile updated successfully!', data: updatedScholar });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

export default scholarRouter;