import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const Photo = mongoose.model('Photo', PhotoSchema);
export default Photo;