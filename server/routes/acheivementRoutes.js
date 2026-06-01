import express from 'express';
import Achievement from '../models/Achievement.js';
import { protect } from '../middleware/authMiddleware.js';

const achievementRouter = express.Router(); // Fixed spelling

// GET all
achievementRouter.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find({}).sort({ createdAt: -1 }); // Changed to createdAt for more reliable ordering
    res.status(200).json({ success: true, data: achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new
achievementRouter.post('/', protect, async (req, res) => {
  try {
    const newAchievement = await Achievement.create(req.body);
    res.status(201).json({ success: true, message: 'Honors milestone archived.', data: newAchievement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update (Required for your Edit functionality)
achievementRouter.put('/:id', protect, async (req, res) => {
  try {
    const updatedAchievement = await Achievement.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!updatedAchievement) return res.status(404).json({ success: false, message: 'Achievement not found.' });
    res.status(200).json({ success: true, message: 'Record updated.', data: updatedAchievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE
achievementRouter.delete('/:id', protect, async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Honor metric index target does not exist.' });
    res.status(200).json({ success: true, message: 'Honor dataset cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default achievementRouter;