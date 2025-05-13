import mongoose from 'mongoose';

const SegmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Segment name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  rules: {
    type: Array,
    default: []
  },
  audienceSize: {
    type: Number,
    default: 0
  },
  subscribers: {
    type: Number,
    default: 0
  },
  clickRate: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Segment', SegmentSchema);