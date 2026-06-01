import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Automatically hash the password before saving it to the database
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
 try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  
  } catch (err) {
    throw err; 
  }
});

// Helper method to verify passwords during login
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Admin', adminSchema);