import mongoose from 'mongoose';

const scholarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scholar name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Scholar role is required'],
    trim: true,
    default: 'Ph.D. Scholar'
  },
  email: {
    type: String,
    required: [true, 'Scholar email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  researchTopic: {
    type: String,
    trim: true
  },
  imageUrl: {
    id: String,
    webViewLink: String
  },
  linkedinUrl: {
    type: String,
    default: ''
  },
  joinedYear: {
    type: Number,
    required: [true, 'Year joined is required']
  },
  status: {
  type: String,
  enum: ['Current', 'Alumni'],
  default: 'Current' // All new scholars start as active
  },
  graduationYear: {
  type: Number,
  default: null 
}
}, {
  timestamps: true // Auto-generates createdAt and updatedAt fields
});

const Scholar = mongoose.model('Scholar', scholarSchema);
export default Scholar;