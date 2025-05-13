import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'social', 'push', 'promotional', 'announcement', 'win-back', 'loyalty'],
    required: [true, 'Campaign type is required']
  },
  segment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment',
    required: [true, 'Segment is required for a campaign']
  },
  segmentName: {
    type: String,
    trim: true
  },
  template: {
    type: String,
    enum: ['promotional', 'newsletter', 'announcement', 'discount'],
    default: 'promotional'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  budget: {
    type: Number,
    default: 0
  },
  goal: {
    type: String,
    trim: true
  },
  audienceSize: {
    type: Number,
    default: 0
  },
  sent: {
    type: Number,
    default: 0
  },
  opened: {
    type: Number,
    default: 0
  },
  clicked: {
    type: Number,
    default: 0
  },
  failed: {
    type: Number,
    default: 0
  },
  performance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Active', 'Completed', 'Paused', 'Cancelled'],
    default: 'Draft'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    subject: String,
    body: String,
    images: [String],
    callToAction: String
  }
}, {
  timestamps: true
});

// Calculate open rate
CampaignSchema.methods.calculateOpenRate = function() {
  if (this.sent <= 0) return 0;
  return (this.opened / this.sent) * 100;
};

// Calculate click rate
CampaignSchema.methods.calculateClickRate = function() {
  if (this.sent <= 0) return 0;
  return (this.clicked / this.sent) * 100;
};

// Update campaign performance
CampaignSchema.methods.updatePerformance = function() {
  const clickRate = this.calculateClickRate();
  
  if (clickRate > 25) {
    this.performance = 'high';
  } else if (clickRate > 10) {
    this.performance = 'medium';
  } else {
    this.performance = 'low';
  }
  
  return this.performance;
};

export default mongoose.model('Campaign', CampaignSchema);