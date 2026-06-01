import express from 'express';
import multer from 'multer'; 
import Project from '../models/Project.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadPdfToDrive } from '../config/driveService.js'; 

const projectRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// -------------------------------------------------------------
// GET: Fetch Active Roster (Sorted by creation history pipeline)
// -------------------------------------------------------------
projectRouter.get('/', async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// POST: Initialize New Research Project Log
// -------------------------------------------------------------
projectRouter.post('/', protect, upload.single('pdfFile'), async (req, res) => {
  try {
    const projectData = { ...req.body };

    // Explicitly fallback empty strings to guarantee model constraints stay happy
    if (projectData.grantValue === 'undefined') projectData.grantValue = '';
    if (projectData.fundingAgency === 'undefined') projectData.fundingAgency = '';
    if (projectData.outcome === 'undefined') projectData.outcome = '';

    // If an application attachment is provided, stream it directly to your professor's Google Drive
    if (req.file) {
      const googleDriveUrl = await uploadPdfToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      projectData.pdfUrl = googleDriveUrl; 
    }

    const newProject = await Project.create(projectData);
    res.status(201).json({ success: true, message: 'Project registry initialized.', data: newProject });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// PUT: Modify Records or Toggle Completion States 
// -------------------------------------------------------------
projectRouter.put('/:id', protect, upload.single('pdfFile'), async (req, res) => {
  try {
    const projectData = { ...req.body };

    // If an update payload passes a new file via multipart stream data
    if (req.file) {
      const googleDriveUrl = await uploadPdfToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      projectData.pdfUrl = googleDriveUrl;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      projectData, // Pass the parsed dataset body containing your new Google Drive pdfUrl
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: 'Project item not found.' });
    }

    res.status(200).json({ success: true, message: 'Project layout record updated.', data: updatedProject });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// DELETE: Drop Projects Out of Data Repositories
// -------------------------------------------------------------
projectRouter.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Target item is outside operational bounds.' });
    res.status(200).json({ success: true, message: 'Grant track dropped.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default projectRouter;