// backend/routes/adminApplications.js
import express from 'express';
import Application from '../models/Application.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.get('/applications', protect, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('vacancyId', 'title') 
      .sort({ appliedAt: -1 }); 

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.put('/applications/:id/status', protect, async (req, res) => {
  const { status } = req.body;
  
  if (!['Pending', 'Shortlisted', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update.' });
  }

  try {
    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedApp) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Applicant successfully ${status.toLowerCase()}.`,
      data: updatedApp
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.delete('/applications/:id', protect, async (req, res) => {
  try {
    const deletedApp = await Application.findByIdAndDelete(req.params.id);

    if (!deletedApp) {
      return res.status(404).json({ success: false, message: 'Application not found or already removed.' });
    }

    res.status(200).json({
      success: true,
      message: 'Application records permanently purged.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;