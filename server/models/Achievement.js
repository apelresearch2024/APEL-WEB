import mongoose from "mongoose";
const AchievementSchema = new mongoose.Schema({
  title: String,
  year: String,
  category: { type: String, enum: ['Award', 'Grant'], default: 'Award' }
});
const Achievement= mongoose.model('Achievement', AchievementSchema);
export default Achievement
