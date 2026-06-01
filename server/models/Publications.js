import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Patent', 'Journal', 'Conference'],
    default: 'Journal'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: {
    type: String,
    required: true,
    trim: true // e.g., "A. Wanode, and S. Belkhode"
  },
  venue: {
    type: String,
    required: true,
    trim: true // Stores Journal Name, Conference Title, or Institution like "IIT Roorkee"
  },
  detail: {
    type: String,
    trim: true // e.g., "vol. 39, no. 9, pp. 10731" or "Application filed on Jan. 6"
  },
  number: {
    type: String,
    trim: true // e.g., "App. No. 202611001421" or "Pat. No. 398367"
  },
  year: {
    type: Number,
    required: true
  },
  link: {
    type: String,
    trim: true // Optional external link to URL repository asset
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Publication= mongoose.model('Publication', publicationSchema);
export default Publication;