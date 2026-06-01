// backend/routes/adminApplications.js
import express from 'express';
import Application from '../models/Application.js';

const router = express.Router();

// 1. GET: Fetch all applications with job details populated
router.get('/admin/applications', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('vacancyId', 'title') // Automatically fetches only the title from the Vacancy collection
      .sort({ appliedAt: -1 }); // Newest submissions first

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. PATCH: Update applicant pipeline status (Shortlist / Reject)
router.patch('/admin/applications/:id/status', async (req, res) => {
  const { status } = req.body;
  
  // Guard clause against malicious/invalid status updates
  if (!['Shortlisted', 'Rejected'].includes(status)) {
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

export default router;