import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Photo from '../models/Photos.js';
import { uploadPdfToDrive,deleteFileFromDrive} from '../config/driveService.js';
const photoRouter = express.Router();
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only system formats (.jpeg, .jpg, .png, .webp) are allowed.'));
    }
};
const upload = multer({ storage: multer.memoryStorage(),fileFilter: fileFilter });

// ================= API ENDPOINTS =================

// GET /api/photos
photoRouter.get('/', async (req, res) => {
    try {
        const photos = await Photo.find().sort({ date: -1 });
        res.json({ success: true, data: photos });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error pulling catalog assets.' });
    }
});

// POST /api/photos/upload
photoRouter.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided.' });
        }

        // Upload buffer to Google Drive
        const driveData = await uploadPdfToDrive(
            req.file.buffer, 
            req.file.originalname, 
            req.file.mimetype
        );

        // Save the webViewLink (or direct link) to your MongoDB
        const newPhoto = new Photo({ 
            url: driveData.webViewLink, // Google Drive public view link
            driveId: driveData.id       // Save this to delete later
        });
        await newPhoto.save();

        res.status(201).json({ success: true, data: newPhoto });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/photos/:id
photoRouter.delete('/:id', async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (!photo) return res.status(404).json({ success: false, message: 'Record not found.' });

        // Only attempt to delete from Drive if a driveId actually exists
        if (photo.driveId && photo.driveId.trim() !== "") {
            try {
                await deleteFileFromDrive(photo.driveId);
            } catch (driveErr) {
                console.error("Google Drive API Error:", driveErr);
                return res.status(500).json({ success: false, message: 'Failed to delete file from Cloud storage.' });
            }
        }

        // Always proceed to delete from MongoDB
        await photo.deleteOne();
        res.json({ success: true, message: 'Asset deleted successfully.' });
    } catch (err) {
        console.error("Router Error:", err);
        res.status(500).json({ success: false, message: 'Server error during deletion.' });
    }
});
export default photoRouter;