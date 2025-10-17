import mongoose from 'mongoose';

const sheetSchema = new mongoose.Schema({
  sheetId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  companyName: { type: String, required: true }, // luxuryGoogle, luxuryMeta, etc.
  data: { type: Array, default: [] },
  sourceType: { type: String, enum: ['file', 'url'], default: 'file' },
  sourceUrl: { type: String },
  uploadedBy: { type: String, default: 'unknown' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Sheet = mongoose.model('Sheet', sheetSchema);

export default Sheet;