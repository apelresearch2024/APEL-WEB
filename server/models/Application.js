// backend/models/Application.js
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  vacancyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vacancy', // Connects each application to a specific job opening
    required: true 
  },
  applicantName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  applicantEmail: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true
  },
  contact: {
    type: String,
    trim: true
  },
  statement: {
    type: String,
    trim: true
  },
  resumeUrl: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Shortlisted', 'Rejected'], 
    default: 'Pending' 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);