import mongoose from 'mongoose';

const VacancySchema = new mongoose.Schema({
  title: { type: String, required: true },
  project: { type: String, required: true },
  qualification: { type: String, required: true },
  stipend: { type: String, required: true },
  slots: { type: String, required: true },
  deadline: { type: String, required: true },
  pdfPath: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Vacancy', VacancySchema);