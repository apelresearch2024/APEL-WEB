// models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  pi: {
    type: String,
    required: [true, 'Principal Investigator name is required'],
    default: 'Prof. Satish Shamsunder Belkhode'
  },
  duration: {
    type: String,
    required: [true, 'Project duration timeline is required']
  },
  startDate: { 
    type: Date 
  },
  grantValue: {
    type: String,
  },
  fundingAgency: {
    type: String,
    trim: true,
    default: ''
  },
  outcome: {
    type: String,
    default: ''
  },
  pdfUrl: {
    id: String,
    webViewLink: String
  },
  status: {
    type: String,
    required: true,
    enum: ['Ongoing', 'Completed'],
    default: 'Ongoing'
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
export default Project;