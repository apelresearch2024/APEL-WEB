import express from 'express';
import multer from 'multer';
import Vacancy from '../models/Vacancy.js';
import { uploadPdfToDrive } from '../config/driveService.js'; 

const vacancyRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// -------------------------------------------------------------
// GET: Fetch All Vacancy Listings
// -------------------------------------------------------------
vacancyRouter.get('/', async (req, res) => {
  try {
    const data = await Vacancy.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) { 
    res.status(500).json({ success: false, error: err.message }); 
  }
});

// -------------------------------------------------------------
// POST: Initialize a New Vacancy Log (With Google Drive Upload)
// -------------------------------------------------------------
vacancyRouter.post('/', upload.single('pdfFile'), async (req, res) => {
  try {
    const vacancyData = { ...req.body };
    
    // If a notification flyer or description PDF is included, sync to Google Drive
    if (req.file) {
      const googleDriveUrl = await uploadPdfToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      vacancyData.pdfPath = googleDriveUrl; // Saves the clean, shareable Google Drive link
    } else {
      vacancyData.pdfPath = null;
    }
    
    const newItem = await Vacancy.create(vacancyData);
    res.json({ success: true, data: newItem });
  } catch (err) { 
    res.status(400).json({ success: false, error: err.message }); 
  }
});

// -------------------------------------------------------------
// PUT: Modify Vacancies or Swap Attached PDFs
// -------------------------------------------------------------
vacancyRouter.put('/:id', upload.single('pdfFile'), async (req, res) => {
  try {
    const vacancyData = { ...req.body };

    // If an update payload passes a new flyer via multipart stream data
    if (req.file) {
      const googleDriveUrl = await uploadPdfToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      vacancyData.pdfPath = googleDriveUrl;
    }

    const updatedVacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      vacancyData,
      { new: true, runValidators: true }
    );

    if (!updatedVacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy listing not found.' });
    }

    res.json({ success: true, message: 'Vacancy listing updated.', data: updatedVacancy });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// DELETE: Drop Vacancies Out of Active Database Tracking
// -------------------------------------------------------------
vacancyRouter.delete('/:id', async (req, res) => {
  try {
    const vacancy = await Vacancy.findByIdAndDelete(req.params.id);
    if (!vacancy) return res.status(404).json({ success: false, error: 'Listing not found.' });
    
    // Note: To match consistency, the metadata link drops out of MongoDB,
    // but the actual flyer PDF remains archive-safe in your professor's Drive folder.
    res.json({ success: true, message: 'Vacancy profile removed successfully.' });
  } catch (err) { 
    res.status(400).json({ success: false, error: err.message }); 
  }
});

export default vacancyRouter;