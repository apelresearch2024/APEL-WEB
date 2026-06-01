import express from 'express';
import multer from 'multer';
import Announcement from '../models/Announcements.js';

const announcementRouter = express.Router();
const upload = multer(); // Used for parsing multipart/form-data

announcementRouter.post('/', upload.none(), async (req, res) => {
  try {
    const { title, description, date } = req.body;

    // Basic server-side validation
    if (!title || !description || !date) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newItem = await Announcement.create({ title, description, date });
    res.status(201).json({ success: true, data: newItem });
  } catch (err) { 
    console.error("Announcement Creation Error:", err);
    res.status(500).json({ success: false, message: "Server error while posting announcement" }); 
  }
});

announcementRouter.get('/', async (req, res) => {
  try {
    const data = await Announcement.find().sort({ date: -1 });
    res.json({ success: true, data });
  } catch (err) { 
    console.error("Announcement Fetch Error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching" }); 
  }
});

announcementRouter.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await Announcement.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (err) { 
    console.error("Announcement Delete Error:", err);
    res.status(400).json({ success: false, message: "Invalid ID format" }); 
  }
});
announcementRouter.put('/:id', upload.none(), async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const updatedItem = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, description, date },
      { returnDocument: 'after' }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, data: updatedItem });
  } catch (err) {
    console.error("Announcement Update Error:", err);
    res.status(500).json({ success: false, message: "Server error while updating" });
  }
});
export default announcementRouter;