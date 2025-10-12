import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
  sheetName: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  sourceType: {
    type: String,
    enum: ['file', 'url'],
    required: true
  },
  sourceUrl: {
    type: String,
    required: function() {
      return this.sourceType === 'url';
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Data', dataSchema);