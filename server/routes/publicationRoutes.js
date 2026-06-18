import express from 'express';
import multer from 'multer'; 
import Publication from '../models/Publications.js';

const router = express.Router();
const upload = multer(); 

// Fetch all publication 
router.get('/', async (req, res) => {
  try {
    const data = await Publication.find().sort({ year: -1, createdAt: -1 });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Add a new entry 
router.post('/', upload.none(), async (req, res) => {
  try {
    const token = req.headers['x-api-key'] || req.headers['authorization']?.split(' ')[1];
    const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.VITE_ADMIN_SECRET_KEY;

    if (!token || token !== expectedSecret) {
      return res.status(401).json({ success: false, message: 'Unauthorized administrator access key.' });
    }

    const { type, title, authors, venue, detail, number, year, link } = req.body;
    
    if (!type || !title || !authors || !venue || !year) {
      return res.status(400).json({ success: false, message: 'Please complete all required fields.' });
    }

    const newPublication = await Publication.create({
      type, 
      title, 
      authors, 
      venue, 
      detail, 
      number, 
      year: parseInt(year, 10), 
      link
    });

    return res.status(201).json({ success: true, message: 'Publication cataloged!', data: newPublication });
  } catch (error) {
    console.error("Backend Processing Error:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error processing request.' });
  }
});

//Delete a publication entry completely
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers['x-api-key'] || req.headers['authorization']?.split(' ')[1];
    const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.VITE_ADMIN_SECRET_KEY;

    if (!token || token !== expectedSecret) {
      return res.status(401).json({ success: false, message: 'Unauthorized operational access.' });
    }

    const deletedItem = await Publication.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Publication item not identified.' });
    }

    return res.status(200).json({ success: true, message: 'Publication deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server drop exception.' });
  }
});
//  Modify an existing publication entry 
router.put('/:id', upload.none(), async (req, res) => {
  try {
    const token = req.headers['x-api-key'] || req.headers['authorization']?.split(' ')[1];
    const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.VITE_ADMIN_SECRET_KEY;

    if (!token || token !== expectedSecret) {
      return res.status(401).json({ success: false, message: 'Unauthorized operational access.' });
    }

    const { id } = req.params;
    
    const { type, title, authors, venue, detail, number, year, link } = req.body;

    if (!type || !title || !authors || !venue || !year) {
      return res.status(400).json({ success: false, message: 'Required validation fields missing.' });
    }

    const updatedPublication = await Publication.findOneAndUpdate(
      { _id: id }, 
      {
        type,
        title,
        authors,
        venue,
        detail: detail || "",   
        number: number || "",   
        year: parseInt(year, 10), 
        link: link || ""
      },
      {returnDocument: 'after', runValidators: true }
    );

    if (!updatedPublication) {
      return res.status(404).json({ success: false, message: 'Target publication entry not found.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Publication adjustments applied successfully.', 
      data: updatedPublication 
    });

  } catch (error) {
    console.error("Backend Edit Processing Error:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error modifying document.' });
  }
});
export default router;
